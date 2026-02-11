"use client"

import React, { useState } from 'react'
import { toast } from 'sonner'

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    email: '',
    message: ''
  })

  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format'
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const isFormComplete = () => {
    return (
      formData.name.trim() !== '' &&
      formData.companyName.trim() !== '' &&
      formData.email.trim() !== '' &&
      formData.message.trim() !== ''
    )
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form
    if (!validateForm()) {
      toast.error('Please fill in all fields correctly')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success('We recieved your inquire successfully! We will contact you shortly.')
        
        // Reset form after successful submission
        setFormData({
          name: '',
          companyName: '',
          email: '',
          message: ''
        })
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to send booking request. Please try again.')
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      toast.error('An error occurred. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className=" relative overflow-hidden md:pb-24">
      
      <div className="relative z-10 flex items-center justify-center p-2 py-8 md:px-12">
        <div className="w-full lg:max-w-[80%] bg-white md:shadow-2xl border border-gray-300 md:border-gray-100  rounded-4xl p-4 md:p-12">
           {/* Heading */}
                <p className="text-gray-800 font-medium mb-3"> Contact Us</p>
                <h2 className="text-3xl  font-bold tracking-tight mb-12 text-black">
                    Send Us Your Inquire Now
                </h2>
          <form onSubmit={handleSubmit} className="space-y-16">
            {/* Top row - Name and Company Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-18">
              <div>
                <label className="block text-black font-medium italic text-lg mb-3 text-left">
                  Name <span className="text-gray-900">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className={`w-full bg-transparent border-b text-black placeholder-gray-500 focus:outline-none transition-colors pb-2 italic ${
                    errors.name
                      ? 'border-red-400 focus:border-red-400'
                      : 'border-gray-500 focus:border-gray-300'
                  }`}
                />
                {errors.name && <p className="text-red-300 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-black font-medium italic text-lg mb-3 text-left">
                  Company Name <span className="text-gray-900">*</span>
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="Enter your company name"
                  className={`w-full bg-transparent border-b text-black placeholder-gray-500 focus:outline-none transition-colors pb-2 italic ${
                    errors.companyName
                      ? 'border-red-400 focus:border-red-400'
                      : 'border-gray-500 focus:border-gray-300'
                  }`}
                />
                {errors.companyName && <p className="text-red-300 text-sm mt-1">{errors.companyName}</p>}
              </div>
            </div>

            {/* Second row - Email and Message */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-18">
              <div>
                <label className="block text-black font-medium italic text-lg mb-3 text-left">
                  Email <span className="text-gray-900">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email address"
                  className={`w-full bg-transparent border-b text-black placeholder-gray-500 focus:outline-none transition-colors pb-2 italic ${
                    errors.email
                      ? 'border-red-400 focus:border-red-400'
                      : 'border-gray-500 focus:border-gray-300'
                  }`}
                />
                {errors.email && <p className="text-red-300 text-sm mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-black font-medium italic text-lg mb-3 text-left">
                  Tell Us More <span className="text-gray-900">*</span>
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Type your message"
                  rows={1}
                  className={`w-full bg-transparent border-b text-black placeholder-gray-500 focus:outline-none transition-colors pb-2 italic resize-none ${
                    errors.message
                      ? 'border-red-400 focus:border-red-400'
                      : 'border-gray-500 focus:border-gray-300'
                  }`}
                />
                {errors.message && <p className="text-red-300 text-sm mt-1">{errors.message}</p>}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 text-center md:text-start">
              <button
                type="submit"
                disabled={isLoading || !isFormComplete()}
                className={`flex gap-4 font-medium shadow-xl px-8 py-3 rounded-full transition-all duration-300 transform active:scale-95 ${
                  isFormComplete()
                    ? 'bg-brand-red text-white hover:scale-105 cursor-pointer'
                    : 'bg-red-400 text-gray-100 cursor-not-allowed'
                } ${isLoading ? 'opacity-75' : ''}`}
              >
                {isLoading ? 'SUBMITTING...' : 'SUBMIT'}         <img src="/images/08.webp" alt="Previous" className="w-4 h-4 my-auto" />

              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ContactForm