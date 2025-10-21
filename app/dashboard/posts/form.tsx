"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import type { Building } from "@/lib/types"
import { useState, useEffect } from "react"
import useSWR from "swr"
import { fetcher } from "@/helpers/fetch"

export type PostFormData = {
  buildingId: string
  status: "confirming" | "approved"
}

export type Response = {
  result: {
    items: Building[]
    total: number
    page: number
    pageSize: number
    totalPages: number
  }
}

interface PostFormDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: PostFormData) => Promise<void>
  initialData?: Partial<PostFormData>
  title: string
}

export default function PostFormDialog({
  isOpen,
  onOpenChange,
  onSubmit,
  initialData,
  title,
}: PostFormDialogProps) {

  const { data: buildingsData } = useSWR<{ result: Response["result"] }>(`/building?page=1&pageSize=100`, fetcher)
  const buildings = buildingsData?.result || undefined

  const [formData, setFormData] = useState<PostFormData>({
    buildingId: "",
    status: "confirming",
  })

  // 初期値を設定
  useEffect(() => {
    if (initialData) {
      setFormData({
        buildingId: initialData.buildingId ?? "",
        status: initialData.status ?? "confirming",
      })
    } else {
      setFormData({ buildingId: "", status: "confirming" })
    }
  }, [initialData, isOpen])

  if (!buildings) return <p>読み込み中...</p>


  console.log("here", buildings)

  const handleSubmit = async () => {
    if (!formData.buildingId) return alert("建物を選択してください")
    await onSubmit(formData)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg min-h-[250px] p-6">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>投稿の状態や建物を設定できます</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* 建物選択 */}
          <div className="space-y-2">
            <Label>建物</Label>
            <Select
              value={formData.buildingId}
              onValueChange={(val) => setFormData({ ...formData, buildingId: val })}
            >
              <SelectTrigger>
                <SelectValue placeholder="建物を選択" />
              </SelectTrigger>
              <SelectContent>
                {buildings.items.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 状態選択 */}
          <div className="space-y-2">
            <Label>状態</Label>
            <Select
              value={formData.status}
              onValueChange={(val: "confirming" | "approved") =>
                setFormData({ ...formData, status: val })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="confirming">confirming</SelectItem>
                <SelectItem value="approved">approved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>キャンセル</Button>
          <Button onClick={handleSubmit}>保存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
