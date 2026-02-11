import React from 'react'
import ContactForm from '../ui/ContactForm'

const ContactUs = () => {
    return (
        <section id='contact' className='relative md:border-b border-[#701524] lg:border-none px-4 md:px-0'>

            <div className='text-center'>
                {/* Background pattern - red finger lines */}
                {/* <div
                    className="hidden lg:block absolute inset-0 "
                    style={{
                        backgroundImage: 'url(/home/howItHappens/2.webp)',
                        backgroundSize: '26%',
                        backgroundPosition: 'left top',
                        backgroundRepeat: 'no-repeat',
                    }}
                /> */}
                {/* mobile */}
                {/* <div
                    className="lg:hidden  absolute inset-0 "
                    style={{
                        backgroundImage: 'url(/home/howItHappens/2.webp)',
                        backgroundSize: 'contain',
                        backgroundPosition: 'left top',
                        backgroundRepeat: 'no-repeat',
                    }}
                />
                <div className='relative h-16 lg:h-30'/> */}

            
                <ContactForm />
                {/* <div className="absolute inset-x-0 bottom-0 h-44 bg-linear-to-t from-[#731625] via-transparent to-transparent" /> */}

            </div>
        </section>
    )
}

export default ContactUs