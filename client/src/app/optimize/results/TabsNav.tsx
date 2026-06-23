"use client"
import React from "react"

export default function TabsNav({ tabs, active, onChange }: Props) {
  return (
    <nav className="sticky top-4 z-20 bg-slate-900/60 border border-slate-800/80 backdrop-blur-md p-2 rounded-xl shadow-2xl">
      <ul className="flex gap-2 overflow-x-auto scrollbar-none py-1 px-1">
        {tabs.map((t) => (
          <li key={t} className="flex-shrink-0">
            <button
              onClick={() => onChange(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                active === t 
                  ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg shadow-indigo-500/20 scale-105' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              {t}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}

type Props = {
  tabs: string[]
  active: string
  onChange: (tab: string) => void
}