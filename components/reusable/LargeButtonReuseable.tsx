import React from 'react'

interface LargeButtonReuseableProps {
    text: string
    className: string
    disabled?: boolean
    type?: 'button' | 'submit' | 'reset'
    onClick?: () => void
}

export default function LargeButtonReuseable({ 
    text, 
    className, 
    disabled = false, 
    type = 'button',
    onClick 
}: LargeButtonReuseableProps) {
    return (
        <div>
            {/* class name in pass as props */}
            <button 
                className={`${className} cursor-pointer`}
                disabled={disabled}
                type={type}
                onClick={onClick}
            >
                <h1>{text}</h1>
            </button>
        </div>
    )
}
