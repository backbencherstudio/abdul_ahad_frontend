import Footer from '@/app/(client)/_components/Shared/Footer'
import Navbar from '@/app/(client)/_components/Shared/Navbar'
import DriverIcon from '@/components/Icons/Login/Driver'
import GarageIcon from '@/components/Icons/Login/Grage'
import bgImg from '@/public/Image/home/bannerImage.png'
import Link from 'next/link'


export default function CreateAccountPage() {
    const data = [
        {
            id: 1,
            icon: <DriverIcon />,
            title: 'Customer Sign Up',
            href: '/create-account/driver'
        },
        {
            id: 2,
            icon: <GarageIcon />,
            title: 'Garage Sign Up',
            href: '/create-account/pricing'
        }
    ]
    return (
        <>
            <Navbar />
            <div
                style={{ backgroundImage: `url(${bgImg.src})` }}
                className='w-full h-[calc(100vh-136px)] bg-cover bg-center bg-no-repeat flex items-center justify-center'
            >
                <div className='container px-5 2xl:px-0'>
                    <h1 className='text-white text-2xl sm:text-3xl md:text-4xl xl:text-5xl font-medium font-inder text-center mb-8 md:mb-12'>
                        Create a <span className='font-semibold'>simplymot.co.uk</span> Account
                    </h1>

                    <div className='flex items-center justify-center gap-6 md:gap-10 flex-wrap md:flex-nowrap pt-10'>
                        {data.map((item) => (
                            <Link
                                key={item.id}
                                className='bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105 p-8 md:p-10 flex flex-col items-center justify-center min-w-[200px] md:min-w-[250px] min-h-[160px] md:min-h-[200px]'
                                href={item.href}
                            >
                                <div className='mb-4 md:mb-6 flex items-center justify-center'>
                                    {item.icon}
                                </div>
                                <h2 className='text-gray-800 text-lg md:text-xl lg:text-2xl font-semibold text-center'>
                                    {item.title}
                                </h2>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
            <Footer />
        </>
    )
} 
