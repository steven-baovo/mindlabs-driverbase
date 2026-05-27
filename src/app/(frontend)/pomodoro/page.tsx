import FocusTimer from '@/components/focus/FocusTimer'
import FocusSettings from '@/components/focus/FocusSettings'

export default function PomodoroPage() {
  return (
    <main className="w-full h-full flex flex-col bg-background p-4 sm:p-6 lg:p-8 relative overflow-hidden justify-center items-center">
      {/* Top Navigation - Ultra Minimal */}
      <div className="w-full max-w-xl flex items-center justify-between gap-4 mb-4 sm:mb-6 relative z-10 shrink-0">
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary rounded-lg flex items-center justify-center shrink-0">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-white rounded-sm rotate-45" />
          </div>
          <h1 className="text-sm sm:text-lg font-black text-foreground tracking-tighter uppercase whitespace-nowrap">MindFocus</h1>
        </div>
        <FocusSettings />
      </div>

      {/* Main Timer Display */}
      <div className="w-full max-w-xl flex-1 flex flex-col justify-center min-h-0 relative z-10">
        <FocusTimer />
      </div>
    </main>
  )
}
