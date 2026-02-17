'use client'
import { useState } from 'react'
import { motion, useMotionValue, useTransform, type PanInfo } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Heart, X } from 'lucide-react'

export interface SwipeProfile {
  id: string
  username: string
  server: string
  roles: string[]
  rank: string
  description: string
  goal: string
  age?: number
  playTime?: string
}

type Props = {
  profile: SwipeProfile
  onSwipe: (direction: 'left' | 'right') => void
  onLike: () => void
  onPass: () => void
}

export default function SwipeCard({ profile, onSwipe, onLike, onPass }: Props) {
  const [exitX, setExitX] = useState(0)
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-25, 25])
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0])

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (Math.abs(info.offset.x) > 100) {
      setExitX(info.offset.x > 0 ? 200 : -200)
      onSwipe(info.offset.x > 0 ? 'right' : 'left')
    }
  }

  return (
    <motion.div
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      animate={{ x: exitX }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="absolute inset-0"
    >
      <Card className="h-full border-rose-900/50 bg-gradient-to-br from-black via-rose-950/20 to-black backdrop-blur cursor-grab active:cursor-grabbing">
        <CardContent className="flex h-full flex-col justify-between p-6">
          {/* Header */}
          <div>
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-bold text-rose-50">{profile.username}</h3>
                <div className="mt-1 flex items-center gap-2">
                  <Badge variant="outline" className="border-rose-500/50 bg-rose-500/10 text-rose-400">
                    {profile.server}
                  </Badge>
                  <Badge variant="outline" className="border-rose-500/50 bg-rose-500/10 text-rose-400">
                    {profile.rank}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Roles */}
            <div className="mb-4 flex flex-wrap gap-2">
              {profile.roles.map((role) => (
                <Badge key={role} className="bg-rose-600/80 hover:bg-rose-600 text-white">
                  {role}
                </Badge>
              ))}
            </div>

            {/* Description */}
            <p className="text-sm text-muted-foreground line-clamp-4">{profile.description}</p>

            {/* Goal & Stats */}
            <div className="mt-4 flex flex-wrap gap-4 text-sm">
              {profile.goal && (
                <div>
                  <span className="text-muted-foreground">Цель:</span>{' '}
                  <span className="text-rose-400">{profile.goal}</span>
                </div>
              )}
              {profile.age && (
                <div>
                  <span className="text-muted-foreground">Возраст:</span>{' '}
                  <span className="text-rose-50">{profile.age}</span>
                </div>
              )}
              {profile.playTime && (
                <div>
                  <span className="text-muted-foreground">Время:</span>{' '}
                  <span className="text-rose-50">{profile.playTime}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-6 pt-6">
            <Button
              size="lg"
              variant="outline"
              onClick={onPass}
              className="h-16 w-16 rounded-full border-rose-900/50 bg-black/40 hover:bg-rose-950/50 hover:border-rose-800/50 p-0"
            >
              <X className="h-8 w-8 text-rose-400" />
            </Button>
            <Button
              size="lg"
              onClick={onLike}
              className="h-16 w-16 rounded-full bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 p-0"
            >
              <Heart className="h-8 w-8 text-white fill-white" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
