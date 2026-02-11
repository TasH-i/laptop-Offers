import nodemailer from 'nodemailer'
import { NextRequest, NextResponse } from 'next/server'
import path from 'path'

const logoPath = path.join(process.cwd(), 'public', 'images', 'logo.png')

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
})

// User Email Template
const getUserEmailTemplate = (formData: {
  name: string
  email: string
  companyName: string
  message: string
}) => {
  const currentDate = new Date().toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px 0;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                
                <!-- Top Bar -->
                <tr>
                  <td style="background-color: #e60000; padding: 10px 30px; text-align: center;">
                    <span style="color: #ffffff; font-size: 12px;">HOTLINE: +94 112 148 400 | info@laptopoffers.lk</span>
                  </td>
                </tr>

                <!-- Header with Logo -->
                <tr>
                  <td style="background-color: #ffffff; padding: 25px 30px; text-align: center; border-bottom: 3px solid #e60000;">
                    <img src="cid:logo" alt="LaptopOffers.lk" style="max-width: 200px; height: auto;">
                    <p style="margin: 10px 0 0; color: #666; font-size: 13px;">Sri Lanka's Best Laptop Deals</p>
                  </td>
                </tr>

                <!-- Main Content -->
                <tr>
                  <td style="padding: 30px;">
                    <h2 style="color: #e60000; margin: 0 0 5px; font-size: 22px;">Thank You for Contacting Us!</h2>
                    <div style="width: 60px; height: 3px; background-color: #e60000; margin-bottom: 20px;"></div>
                    
                    <p style="color: #333; font-size: 15px; line-height: 1.6;">
                      Dear <strong>${formData.name}</strong>,
                    </p>
                    <p style="color: #555; font-size: 14px; line-height: 1.6;">
                      Thank you for reaching out to LaptopOffers.lk! We have received your inquiry and our team will get back to you within 24 hours.
                    </p>

                    <!-- Inquiry Details -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fafafa; border-radius: 6px; margin: 25px 0; border: 1px solid #eee;">
                      <tr>
                        <td style="background-color: #e60000; padding: 12px 20px; border-radius: 6px 6px 0 0;">
                          <span style="color: #ffffff; font-weight: bold; font-size: 14px;">Your Inquiry Details</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 20px;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="padding: 8px 0; border-bottom: 1px solid #eee; width: 130px; font-weight: bold; color: #e60000; font-size: 13px;">Name:</td>
                              <td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #333; font-size: 13px;">${formData.name}</td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #e60000; font-size: 13px;">Email:</td>
                              <td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #333; font-size: 13px;">${formData.email}</td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #e60000; font-size: 13px;">Company:</td>
                              <td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #333; font-size: 13px;">${formData.companyName}</td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0; font-weight: bold; color: #e60000; font-size: 13px; vertical-align: top;">Message:</td>
                              <td style="padding: 8px 0; color: #333; font-size: 13px;">${formData.message}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- CTA -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 25px 0;">
                      <tr>
                        <td align="center">
                          <p style="color: #555; font-size: 14px; margin-bottom: 15px;">While you wait, check out our latest deals!</p>
                          <a href="https://laptopoffers.lk" style="display: inline-block; background-color: #e60000; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 14px;">
                            Browse Latest Offers
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Timestamp -->
                <tr>
                  <td style="padding: 0 30px;">
                    <p style="text-align: center; font-size: 11px; color: #999; border-top: 1px solid #eee; padding-top: 15px; margin: 0;">
                      Submitted on: ${currentDate}
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #1a1a1a; padding: 25px 30px; text-align: center; margin-top: 20px;">
                    <p style="color: #ffffff; font-size: 14px; font-weight: bold; margin: 0 0 5px;">LaptopOffers.lk</p>
                    <p style="color: #aaa; font-size: 12px; margin: 0 0 10px;">Sri Lanka's Best Laptop Deals & Offers</p>
                    <p style="color: #888; font-size: 11px; margin: 0 0 5px;">+94 112 148 400 | info@laptopoffers.lk</p>
                    <p style="color: #666; font-size: 11px; margin: 15px 0 0;">
                      This is an automated email. Please do not reply to this address.<br>
                      &copy; ${new Date().getFullYear()} LaptopOffers.lk. All rights reserved.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `
}

// Admin Email Template
const getAdminEmailTemplate = (formData: {
  name: string
  email: string
  companyName: string
  message: string
}) => {
  const currentDate = new Date().toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px 0;">
          <tr>
            <td align="center">
              <table width="650" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                
                <!-- Header -->
                <tr>
                  <td style="background-color: #e60000; padding: 25px 30px; text-align: center;">
                    <img src="cid:logo" alt="LaptopOffers.lk" style="max-width: 180px; height: auto; margin-bottom: 10px;">
                    <h2 style="color: #ffffff; margin: 10px 0 0; font-size: 20px;">New Customer Inquiry</h2>
                  </td>
                </tr>

                <!-- Alert Banner -->
                <tr>
                  <td style="padding: 20px 30px 0;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
                      <tr>
                        <td style="padding: 12px 15px;">
                          <span style="font-size: 13px; color: #856404;">
                            <strong>New Inquiry Received</strong> — A potential customer has submitted an inquiry via the contact form. Please review and respond within 24 hours.
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Customer Details -->
                <tr>
                  <td style="padding: 25px 30px;">
                    <h3 style="color: #e60000; margin: 0 0 15px; font-size: 16px;">Customer Details</h3>
                    
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f8f8; border-radius: 6px; border: 1px solid #eee;">
                      <tr>
                        <td style="padding: 15px 20px; border-bottom: 1px solid #eee; width: 130px; font-weight: bold; color: #e60000; font-size: 13px;">Name:</td>
                        <td style="padding: 15px 20px; border-bottom: 1px solid #eee; color: #333; font-size: 13px;">${formData.name}</td>
                      </tr>
                      <tr>
                        <td style="padding: 15px 20px; border-bottom: 1px solid #eee; font-weight: bold; color: #e60000; font-size: 13px;">Email:</td>
                        <td style="padding: 15px 20px; border-bottom: 1px solid #eee; color: #333; font-size: 13px;">
                          <a href="mailto:${formData.email}" style="color: #e60000; text-decoration: none;">${formData.email}</a>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 15px 20px; font-weight: bold; color: #e60000; font-size: 13px;">Company:</td>
                        <td style="padding: 15px 20px; color: #333; font-size: 13px;">${formData.companyName}</td>
                      </tr>
                    </table>

                    <!-- Message Section -->
                    <h3 style="color: #e60000; margin: 25px 0 15px; font-size: 16px;">Customer Message</h3>
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fafafa; border-left: 4px solid #e60000; border-radius: 4px;">
                      <tr>
                        <td style="padding: 20px;">
                          <p style="color: #333; font-size: 14px; line-height: 1.6; margin: 0; white-space: pre-wrap; word-wrap: break-word;">${formData.message}</p>
                        </td>
                      </tr>
                    </table>

                    <!-- Quick Actions -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 25px;">
                      <tr>
                        <td align="center">
                          <a href="mailto:${formData.email}" style="display: inline-block; background-color: #e60000; color: #ffffff; padding: 10px 25px; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 13px;">
                            Reply to Customer
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Timestamp -->
                <tr>
                  <td style="padding: 0 30px;">
                    <p style="text-align: center; font-size: 11px; color: #999; border-top: 1px solid #eee; padding-top: 15px; margin: 0;">
                      <strong>Received:</strong> ${currentDate}
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #1a1a1a; padding: 20px 30px; text-align: center; margin-top: 20px;">
                    <p style="color: #aaa; font-size: 12px; margin: 0;">
                      This is an automated notification from LaptopOffers.lk contact form.<br>
                      Please respond to the customer within 24 hours.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json()

    // Validate form data
    const { name, email, companyName, message } = formData

    if (!name || !email || !companyName || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Send email to user
    await transporter.sendMail({
      from: `"LaptopOffers.lk" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Thank You for Your Inquiry - LaptopOffers.lk',
      html: getUserEmailTemplate(formData),
      attachments: [
        {
          filename: 'logo.png',
          path: logoPath,
          cid: 'logo',
        },
      ],
    })

    // Send email to admin
    await transporter.sendMail({
      from: `"LaptopOffers.lk" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_ADMIN,
      subject: `New Inquiry from ${name} - LaptopOffers.lk`,
      html: getAdminEmailTemplate(formData),
      attachments: [
        {
          filename: 'logo.png',
          path: logoPath,
          cid: 'logo',
        },
      ],
    })

    return NextResponse.json(
      { success: true, message: 'Emails sent successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Email error:', error)
    return NextResponse.json(
      { error: 'Failed to send emails' },
      { status: 500 }
    )
  }
}