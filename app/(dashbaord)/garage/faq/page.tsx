"use client"
import React, { useEffect, useState } from "react"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"

interface FaqItem {
    id: number
    question: string
    answer: string
}

export default function FaqPage() {
    const [faqs, setFaqs] = useState<FaqItem[]>([])

    useEffect(() => {
        fetch("/data/Faq.json")
            .then(res => res.json())
            .then(setFaqs)
    }, [])

    return (
        <div className="max-w-3xl mx-auto mt-8 bg-white rounded-xl p-4 shadow">
            <Accordion type="multiple" className="w-full">
                {faqs.map((faq) => (
                    <AccordionItem value={faq.id.toString()} key={faq.id}>
                        <AccordionTrigger className="text-base font-medium text-gray-900 cursor-pointer">
                            {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-gray-700 text-[15px]">
                            {faq.answer}
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    )
}
