'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function ProfilePage({ onSubmit }: { onSubmit: () => void }) {
  const [formFields, setFormFields] = useState({
    fullName: '',
    passportNumber: '',
    currentAddress: '',
    primaryContactNumber: '',
    permanentAddress: '',
    alternateContactNumber: '',
    dateOfBirth: '',
    panNumber: '',
    aadhaarNumber: '',
    educationDetails: '',
    bloodGroup: '',
  });

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormFields(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setPhotoFile(file || null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);

    if (!photoFile) {
      setMessage('Please upload a photo.');
      setIsError(true);
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();

      // Append text fields
      for (const key in formFields) {
        data.append(key, formFields[key as keyof typeof formFields]);
      }

      // Append file
      data.append('photo', photoFile);

      const result = await fetch('/api/auth/onboarding', {
        method: 'POST',
        body: data,
        credentials: 'include',
      });

      const res = await result.json();

      if (!result.ok) {
        setIsError(true);
        setMessage(res.message || 'Something went wrong');
      } else {
        setMessage('Profile submitted successfully!');
        setIsError(false);
        onSubmit(); 
      }
    } catch (err) {
      console.error(err);
      setIsError(true);
      setMessage('Server error. Try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-md max-w-2xl mx-auto my-8 font-sans">
      <h2 className="text-2xl font-semibold mb-2 text-gray-800">Employee Profile</h2>
      <p className="mb-6 text-gray-600">Please fill in all required fields.</p>

      <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSubmit}>
        {[
          { label: 'Full Name', name: 'fullName', type: 'text' },
          { label: 'Passport Number', name: 'passportNumber', type: 'text' },
          { label: 'Current Address', name: 'currentAddress', type: 'text' },
          { label: 'Primary Contact Number', name: 'primaryContactNumber', type: 'text' },
          { label: 'Permanent Address', name: 'permanentAddress', type: 'text' },
          { label: 'Alternate Contact Number', name: 'alternateContactNumber', type: 'text' },
          { label: 'Date of Birth', name: 'dateOfBirth', type: 'date' },
          { label: 'PAN Number', name: 'panNumber', type: 'text' },
          { label: 'Aadhaar Number', name: 'aadhaarNumber', type: 'text' },
          { label: 'Blood Group', name: 'bloodGroup', type: 'text' },
        ].map((field) => (
          <div key={field.name} className="flex flex-col gap-2">
            <Label htmlFor={field.name}>{field.label}</Label>
            <Input
              id={field.name}
              name={field.name}
              type={field.type}
              placeholder={`Enter ${field.label.toLowerCase()}`}
              value={formFields[field.name as keyof typeof formFields]}
              onChange={handleChange}
              required
            />
          </div>
        ))}

        <div className="col-span-1 md:col-span-2 flex flex-col gap-2">
          <Label htmlFor="educationDetails">Education Details</Label>
          <Textarea
            id="educationDetails"
            name="educationDetails"
            placeholder="Enter educational qualifications"
            value={formFields.educationDetails}
            onChange={handleChange}
            required
          />
        </div>

        <div className="col-span-1 md:col-span-2 flex flex-col gap-2">
          <Label htmlFor="photo">Upload Photo</Label>
          <Input
            id="photo"
            name="photo"
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            required
          />
          <p className="text-xs text-gray-500">Upload a recent passport-size photo</p>
        </div>

        {message && (
          <div className={`col-span-2 text-center text-sm mt-2 ${isError ? 'text-red-500' : 'text-green-600'}`}>
            {message}
          </div>
        )}

        <div className="col-span-2 flex justify-end mt-4">
          <Button
            type="submit"
            disabled={loading}
            className="bg-green-600 cursor-pointer hover:bg-green-700 text-white px-6 py-2 rounded-md"
          >
            {loading ? 'Submitting...' : 'Submit'}
          </Button>
        </div>
      </form>
    </div>
  );
}
