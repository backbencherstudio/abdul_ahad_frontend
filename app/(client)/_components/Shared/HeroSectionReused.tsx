import React from 'react'
import bgImg from '@/public/Image/home/bannerImage.png'

export default function HeroSectionReused({ title }: { title: string }) {
    return (

        // title resueable need pros pass
        <div style={{ backgroundImage: `url(${bgImg.src})` }} className='w-full bg-cover bg-center bg-no-repeat mt-16 md:mt-18 py-24 md:py-30 relative overflow-hidden' >
            <h1 className='text-2xl md:text-3xl lg:text-4xl font-medium text-center text-white'>{title}</h1>
        </div>
    )
}
