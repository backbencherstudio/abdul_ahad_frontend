import React from 'react'

export default function LargeButtonReuseable({ text, color }: { text: string, color: string }) {
    return (
        <div>

            {/* class name in pass as props */}
             <button className={`bg-${color} text-black px-4 py-2 rounded-md`}>
                <h1>{text}</h1>
            </button>
        </div>
    )
}
