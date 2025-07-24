import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import { PrismaClient, AccountType } from '@prisma/client'

export const config = {
  api: {
    bodyParser: false,
  },
}

const prisma = new PrismaClient()

async function parseFormData(req: NextRequest): Promise<{ file: Buffer }> {
  const formData = await req.formData()
  const file = formData.get('file') as File
  if (!file) throw new Error('No file found in form data')
  const arrayBuffer = await file.arrayBuffer()
  return { file: Buffer.from(arrayBuffer) }
}

function parseExcel(buffer: Buffer) {
  const workbook = XLSX.read(buffer, { type: 'buffer' })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  return XLSX.utils.sheet_to_json<Record<string, any>>(sheet, {
    defval: '',
    raw: false,
  })
}

function parseCurrency(value: any): number {
  if (typeof value !== 'string') return Number(value) || 0
  const normalized = value.replace(/,/g, '').replace(/\((.*)\)/, '-$1')
  const parsed = parseFloat(normalized)
  return isNaN(parsed) ? 0 : parsed
}

function parseAccountType(raw: string): AccountType {
  const val = (raw || '').trim()
  if (['Eq', 'Op', 'In', 'Total'].includes(val)) return val as AccountType
  return 'Total'
}

function getModelByType(type: string) {
  const normalizedType = type?.trim() || 'Total'
  switch (normalizedType) {
    case 'Eq': return prisma.equityPerformance
    case 'Op': return prisma.optionsPerformance
    case 'In': return prisma.intradayPerformance
    default: return prisma.totalPerformance
  }
}

const COLUMN_MAPPING: Record<string, string> = {
  'Account': 'accountNumber',
  'Type': 'accountType',
  'Orders': 'orders',
  'Fills': 'fills',
  'Qty': 'qty',
  'Start Cash': 'startCash',
  'Start Unrealized': 'startUnrealized',
  'Start Balance': 'startBalance',
  'Trade Fees': 'tradeFees',
  'Net': 'net',
  'Adj Fees': 'adjFees',
  'Adj Net': 'adjNet',
  'Unrealized Δ': 'unrealizedDelta',
  'Total Δ': 'total',
  'Transfers': 'transfer',
  'End Cash': 'endCash',
  'End Unrealized': 'endUnrealized',
  'End Balance': 'endBalance',
  'Gross': 'gross',
  'Comm': 'comm',
  'Ecn Fee': 'ecnFee',
  'SEC': 'sec',
  'ORF': 'orf',
  'CAT': 'cat',
  'TAF': 'taf',
  'NFA': 'nfa',
  'NSCC': 'nscc',
  'Acc': 'acc',
  'Clr': 'clr',
  'Misc': 'misc',
  'Fee: DailyInterest': 'feeDailyInterest',
  'Fee: Dividends': 'feeDividends',
  'Fee: Misc': 'feeMisc',
  'Fee: Short Interest': 'feeShortInterest',
  'Fee: Stock Locate': 'stockLocate',
  'Fee: Technology': 'techFees',
  'Transfer: Cash In/Out': 'cashInOut',
}

function cleanAndValidateRow(row: Record<string, any>) {
  const cleanRow: Record<string, any> = {}
  for (const [key, value] of Object.entries(row)) {
    if (key.includes('----') || key.includes('boundary') || key.startsWith('__EMPTY')) continue
    if (typeof value === 'string' && (value.includes('\x00') || value.includes('PK\x01\x02'))) continue

    const cleanKey = key.trim()
    const cleanValue = typeof value === 'string' ? value.trim() : value
    const mappedKey = COLUMN_MAPPING[cleanKey] || cleanKey
    cleanRow[mappedKey] = cleanValue
  }
  return cleanRow
}

export async function POST(req: NextRequest) {
  try {
    const { file } = await parseFormData(req)
    const rawData = parseExcel(file)

    let successCount = 0
    let skipCount = 0

    // Fetch admin user (as sender of notifications)
    const adminUser = await prisma.user.findFirst({
      where: {
        profile: {
          role: 'admin',
        },
      },
    })

    for (let i = 0; i < rawData.length; i++) {
      const rawRow = rawData[i]
      const row = cleanAndValidateRow(rawRow)

      const accountNumber = Number(row.accountNumber)
      if (!accountNumber || isNaN(accountNumber)) {
        skipCount++
        continue
      }

      const profile = await prisma.profile.findFirst({
        where: { accountNumber: String(accountNumber) },
      })

      if (!profile) {
        skipCount++
        continue
      }

      const accountType = parseAccountType(row.accountType)
      const model = getModelByType(accountType)

      const dataToInsert = {
        profileId: profile.id,
        recordedAt: new Date(),
        accountNumber,
        accountType,

        orders: parseCurrency(row.orders),
        fills: parseCurrency(row.fills),
        qty: parseCurrency(row.qty),

        startBalance: parseCurrency(row.startBalance),
        startCash: parseCurrency(row.startCash),
        startUnrealized: parseCurrency(row.startUnrealized),

        stockLocate: parseCurrency(row.stockLocate),
        techFees: parseCurrency(row.techFees),
        adjFees: parseCurrency(row.adjFees),
        unrealizedDelta: parseCurrency(row.unrealizedDelta),

        total: parseCurrency(row.total),
        cashInOut: parseCurrency(row.cashInOut),
        transfer: parseCurrency(row.transfer),
        endUnrealized: parseCurrency(row.endUnrealized),
        endBalance: parseCurrency(row.endBalance),
        endCash: parseCurrency(row.endCash),

        net: parseCurrency(row.net),
        tradeFees: parseCurrency(row.tradeFees),
        adjNet: parseCurrency(row.adjNet),
        gross: parseCurrency(row.gross),

        comm: parseCurrency(row.comm),
        ecnFee: parseCurrency(row.ecnFee),
        sec: parseCurrency(row.sec),
        orf: parseCurrency(row.orf),
        cat: parseCurrency(row.cat),
        taf: parseCurrency(row.taf),
        nfa: parseCurrency(row.nfa),
        nscc: parseCurrency(row.nscc),
        acc: parseCurrency(row.acc),
        clr: parseCurrency(row.clr),
        misc: parseCurrency(row.misc),
        feeDailyInterest: parseCurrency(row.feeDailyInterest),
        feeDividends: parseCurrency(row.feeDividends),
        feeMisc: parseCurrency(row.feeMisc),
        feeShortInterest: parseCurrency(row.feeShortInterest),
      }

      await (model as any).create({ data: dataToInsert })
      successCount++

      // 🔔 Send notification to user
      if (adminUser && profile.userId) {
        await prisma.notification.create({
          data: {
            type: 'performance_upload',
            message: `📊 Performance data has been uploaded for account ${accountNumber}.`,
            senderId: adminUser.id,
            recipientId: profile.userId,
          },
        })
      }
    }

    return NextResponse.json({
      message: '✅ Upload completed',
      summary: {
        total: rawData.length,
        successful: successCount,
        skipped: skipCount,
      },
    })
  } catch (error) {
    console.error('❌ Upload failed:', error)
    return NextResponse.json(
      { error: `Upload failed: ${(error as Error).message}` },
      { status: 500 }
    )
  }
}
