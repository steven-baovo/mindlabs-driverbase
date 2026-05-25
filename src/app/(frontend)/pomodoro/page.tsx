import FocusTimer from '@/components/focus/FocusTimer'
import FocusTasks from '@/components/focus/FocusTasks'
import FocusSettings from '@/components/focus/FocusSettings'

export default function PomodoroPage() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center bg-white px-4 sm:px-6 py-10 sm:py-20 min-h-screen relative overflow-y-auto no-scrollbar">
      {/* Top Navigation - Ultra Minimal */}
      <div className="w-full max-w-3xl flex items-center justify-between gap-4 mb-8 sm:mb-16 relative z-10">
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="w-6 h-6 sm:w-10 sm:h-10 bg-primary rounded-lg sm:rounded-2xl flex items-center justify-center shrink-0">
            <div className="w-2.5 h-2.5 sm:w-4 sm:h-4 bg-white rounded-sm rotate-45" />
          </div>
          <h1 className="text-sm sm:text-xl font-black text-foreground tracking-tighter uppercase whitespace-nowrap">MindFocus</h1>
        </div>
        <FocusSettings />
      </div>

      {/* Center Container */}
      <div className="w-full max-w-3xl flex flex-col gap-8 sm:gap-12 relative z-10">
        {/* Main Timer */}
        <FocusTimer />

        {/* Tasks Section - Integrated & Flat */}
        <div className="mt-4 sm:mt-8 border-t border-black/[0.03] pt-10 sm:pt-12">
          <FocusTasks />
        </div>
      </div>

      {/* Footer Hint */}
      <div className="mt-16 sm:mt-20 text-[8px] sm:text-[10px] font-black uppercase tracking-[0.4em] text-black/10 text-center">
        Mindlabs focus protocol v1.0
      </div>
    </main>
  )
}
