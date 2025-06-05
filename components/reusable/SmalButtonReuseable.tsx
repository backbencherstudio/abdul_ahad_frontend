import React from 'react'

export default function SmalButtonReuseable({ text, className }: { text: string, className: string }) {
    return (
        <button className={`${className} cursor-pointer`}>
            <h1>{text}</h1>
        </button>
    )
}
