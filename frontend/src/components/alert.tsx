import { CircleAlert } from "lucide-react"

export const ErrorAlert = ({
  title,
}:{
  title?: string,
}) => {
  return (
    <div className="flex gap-3 rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-red-400">
      <div className="mt-0.5">
        <CircleAlert />
      </div>

      <div className="space-y-2">
        <p className="font-medium text-red-400">
          {title}
        </p>
      </div>
    </div>
  )
}
