"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

import { CategoryFormData } from "./page"

type CategoryFormDialogProps = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CategoryFormData) => void
  initialData?: Partial<CategoryFormData>
  title: string
}


export default function CategoryFormDialog({ isOpen, onOpenChange, onSubmit, initialData = {}, title }: CategoryFormDialogProps) {
  const [formData, setFormData] = useState<CategoryFormData>({ name: "", ...initialData })

  const handleClose = () => onOpenChange(false)

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="category-name">カテゴリ名</Label>
            <Input
              id="category-name"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="例: お知らせ"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>キャンセル</Button>
          <Button onClick={() => onSubmit(formData)}>保存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}