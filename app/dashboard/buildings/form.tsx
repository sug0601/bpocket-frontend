"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { BuildingFormData} from "./page"
import { Category } from "@/lib/types"

type BuildingFormDialogProps = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: BuildingFormData, file: File | null) => void
  initialData?: Partial<BuildingFormData>
  categories?: Category[]
  title: string
}

const initialFormData: BuildingFormData = {
  name: "",
  url: "",
  lat: "",
  lon: "",
  categoryId: "",
  architect: "",
  description: "",
  thumbnail: "",
}

export default function BuildingFormDialog({ isOpen, onOpenChange, onSubmit, initialData = {}, categories = [], title }: BuildingFormDialogProps) {
  const [formData, setFormData] = useState<BuildingFormData>({ ...initialFormData, ...initialData })
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)

  const handleClose = () => onOpenChange(false)

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>ビル情報を入力してください</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <Label>ビル名</Label>
          <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />

          <Label>説明</Label>
          <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={2} />

          <Label>URL</Label>
          <Input value={formData.url} onChange={(e) => setFormData({ ...formData, url: e.target.value })} />

          <Label>緯度</Label>
          <Input value={formData.lat} onChange={(e) => setFormData({ ...formData, lat: e.target.value })} />

          <Label>経度</Label>
          <Input value={formData.lon} onChange={(e) => setFormData({ ...formData, lon: e.target.value })} />

          <Label>カテゴリ</Label>
          <select className="border rounded-md p-2 w-full" value={formData.categoryId} onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}>
            <option value="">選択してください</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          <Label>設計者</Label>
          <Input value={formData.architect} onChange={(e) => setFormData({ ...formData, architect: e.target.value })} />

          <Label>サムネイル</Label>
          <Input type="file" accept="image/*" onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)} />
          {thumbnailFile && <img src={URL.createObjectURL(thumbnailFile)} alt="preview" className="mt-2 h-32 rounded object-cover" />}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>キャンセル</Button>
          <Button onClick={() => onSubmit(formData, thumbnailFile)}>保存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}