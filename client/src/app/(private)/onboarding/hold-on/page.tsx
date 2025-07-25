'use client'

import { Card, CardContent, CardDescription } from '@/components/ui/card'
import { Timer } from 'lucide-react'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'

export default function NewsletterTimerPage() {
  const [timeLeft, setTimeLeft] = useState(3600) // 1 hour in seconds
  const [isSubscribed, setIsSubscribed] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer) // Cleanup on unmount
  }, [])

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hrs.toString().padStart(2, '0')}:${mins
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleSubscribe = () => {
    setIsSubscribed(true)
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        <Card className="border-none bg-white/95 shadow-xl backdrop-blur-sm">
          <CardContent className="grid gap-6 pt-8">
            <motion.div
              className="flex flex-col items-center gap-4"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Timer className="h-24 w-24 text-[#040924]" />
              <h1 className="text-2xl font-bold text-[#040924] text-center">
              Hold on tight!
              </h1>
              <CardDescription className="text-center text-[#040924]/80 text-lg">
                {isSubscribed ? (
                    'You’re all set! Your free trial newsletter is on its way!'
                ) : (
                    <>
                    Cause you'll be blown away by your free trial newsletter. <br />
                    Dropping in:
                    </>
                )}
                </CardDescription>

              <motion.div
                className="text-4xl font-mono font-semibold text-[#040924] bg-[#e6e6fa] py-3 px-6 rounded-lg shadow-inner"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 1, repeat: Infinity, repeatDelay: 1 }}
              >
                {formatTime(timeLeft)}
              </motion.div>
              {!isSubscribed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <Button
                    onClick={handleSubscribe}
                    className="mt-4 bg-[#040924] text-white hover:bg-[#1a1a3d] transition-colors duration-300"
                  >
                    Subscribe Now
                  </Button>
                </motion.div>
              )}
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}