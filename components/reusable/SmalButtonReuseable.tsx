import React from 'react'

interface SmalButtonReuseableProps {
    text: string
    className: string
    disabled?: boolean
    type?: 'button' | 'submit' | 'reset'
    onClick?: () => void
}


export default function SmalButtonReuseable({ text, className, disabled = false, type = 'button', onClick }: SmalButtonReuseableProps) {
    return (
        <button className={`${className} cursor-pointer`}
            disabled={disabled}
            type={type}
            onClick={onClick}
        >
            <h1>{text}</h1>
        </button>
    )
}
