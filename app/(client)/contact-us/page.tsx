import React from 'react'
import ContactUs from '@/app/(client)/_components/Home/ContactUs'
import CustomersSay from '@/app/(client)/_components/Home/CustomersSay'
import Frequently from '@/app/(client)/_components/Home/Frequently'
import LineStyle from '@/app/(client)/_components/Home/LineStyle'

export default function ContactUsPage() {
  return (
    <div>
      <ContactUs />
      <CustomersSay />
      <LineStyle />
      <Frequently />
    </div>
  )
}
