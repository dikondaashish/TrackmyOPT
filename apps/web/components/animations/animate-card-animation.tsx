"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight } from "lucide-react"
import Image from "next/image"

interface Card {
    id: number
    contentType: 1 | 2 | 3
}

const cardData = {
    1: {
        title: "Landed Amazon Offer",
        description: "Used the H-1B sponsor filter to find verified roles.",
        image: "https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=2070&auto=format&fit=crop", // Group of happy students/people
    },
    2: {
        title: "Never Missed a Deadline",
        description: "Automated standard alerts saved my STEM OPT status.",
        image: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?q=80&w=2072&auto=format&fit=crop", // Calendar/Planning
    },
    3: {
        title: "Resume ATS 95/100",
        description: "Optimized my resume specifically for OPT hiring.",
        image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=2070&auto=format&fit=crop", // Writing/Resume
    },
}

const initialCards: Card[] = [
    { id: 1, contentType: 1 },
    { id: 2, contentType: 2 },
    { id: 3, contentType: 3 },
]

const positionStyles = [
    { scale: 1, y: 12 },
    { scale: 0.95, y: -16 },
    { scale: 0.9, y: -44 },
]

const exitAnimation = {
    y: 340,
    scale: 1,
    zIndex: 10,
}

const enterAnimation = {
    y: -16,
    scale: 0.9,
}

function CardContent({ contentType }: { contentType: 1 | 2 | 3 }) {
    const data = cardData[contentType]

    return (
        <div className="flex h-full w-full flex-col gap-4">
            <div className="-outline-offset-1 flex h-[200px] w-full items-center justify-center overflow-hidden rounded-xl outline outline-black/10 dark:outline-white/10 bg-muted relative">
                <Image
                    src={data.image}
                    alt={data.title}
                    fill
                    className="select-none object-cover transition-transform duration-500 hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
            </div>
            <div className="flex w-full items-center justify-between gap-2 px-3 pb-6">
                <div className="flex min-w-0 flex-1 flex-col text-left">
                    <span className="truncate font-semibold text-foreground text-lg">{data.title}</span>
                    <span className="text-muted-foreground text-sm line-clamp-2">{data.description}</span>
                </div>
                <button className="flex h-10 shrink-0 cursor-pointer select-none items-center gap-0.5 rounded-full bg-primary pl-4 pr-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
                    Read
                    <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    )
}

function AnimatedCard({
    card,
    index,
    isAnimating,
}: {
    card: Card
    index: number
    isAnimating: boolean
}) {
    const { scale, y } = positionStyles[index] ?? positionStyles[2]
    const zIndex = index === 0 && isAnimating ? 10 : 3 - index

    const exitAnim = index === 0 ? exitAnimation : undefined
    const initialAnim = index === 2 ? enterAnimation : undefined

    return (
        <motion.div
            key={card.id}
            initial={initialAnim}
            animate={{ y, scale }}
            exit={exitAnim}
            transition={{
                type: "spring",
                duration: 0.6,
                bounce: 0.1,
            }}
            style={{
                zIndex,
                left: "50%",
                x: "-50%",
                bottom: 0,
            }}
            className="absolute flex h-[300px] w-[340px] items-center justify-center overflow-hidden rounded-2xl border border-border bg-card p-2 shadow-2xl will-change-transform sm:w-[400px]"
        >
            <CardContent contentType={card.contentType} />
        </motion.div>
    )
}

export default function AnimatedCardStack() {
    const [cards, setCards] = useState(initialCards)
    const [isAnimating, setIsAnimating] = useState(false)
    const [nextId, setNextId] = useState(4)

    const handleAnimate = useCallback(() => {
        if (isAnimating) return
        setIsAnimating(true)

        // Wait just a bit for the animation to actually start visually if needed, 
        // but framer motion handles exit gracefully. 
        // We immediately update state to trigger exit of index 0.

        setTimeout(() => {
            const nextContentType = ((cards[0].contentType % 3) + 1) as 1 | 2 | 3
            setCards((prev) => {
                const newCards = [...prev.slice(1), { id: nextId, contentType: nextContentType }];
                return newCards
            })
            setNextId((prev) => prev + 1)
            setIsAnimating(false)
        }, 600) // Match duration typical of the spring or slightly less to allow rapid clicking if tuned
    }, [isAnimating, cards, nextId])

    // Auto-animate every few seconds for engagement
    useEffect(() => {
        const interval = setInterval(() => {
            handleAnimate()
        }, 4000)
        return () => clearInterval(interval)
    }, [handleAnimate])

    return (
        <div className="flex w-full flex-col items-center justify-center pt-8 pb-4">
            <div className="relative h-[340px] w-full sm:w-[500px]">
                <AnimatePresence mode="popLayout">
                    {cards.slice(0, 3).map((card, index) => (
                        <AnimatedCard key={card.id} card={card} index={index} isAnimating={isAnimating} />
                    ))}
                </AnimatePresence>
            </div>

            <div className="relative z-10 mt-6 flex w-full items-center justify-center">
                <button
                    onClick={handleAnimate}
                    className="flex h-10 cursor-pointer select-none items-center justify-center gap-2 overflow-hidden rounded-full border border-border bg-background px-6 font-medium text-foreground transition-all hover:bg-muted active:scale-[0.98] shadow-sm"
                >
                    Next Story
                    <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    )
}
