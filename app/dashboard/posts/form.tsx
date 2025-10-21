"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Search, X } from "lucide-react"
import type { Building } from "@/lib/types"
import { useState, useEffect, useRef } from "react"
import useSWR from "swr"
import { fetcher } from "@/helpers/fetch"
import { cn } from "@/lib/utils"

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

  const { data: buildingsData, isLoading } = useSWR<{ result: Response["result"] }>(`/building?page=1&pageSize=100`, fetcher)
  const buildings = buildingsData?.result

  const [formData, setFormData] = useState<PostFormData>({
    buildingId: "",
    status: "confirming",
  })

  const [searchValue, setSearchValue] = useState("")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

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

  // 外部クリックでドロップダウンを閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDropdownOpen])

  const handleSubmit = async () => {
    if (!formData.buildingId) return alert("建物を選択してください")
    await onSubmit(formData)
  }

  const selectedBuilding = buildings?.items.find((b) => b.id === formData.buildingId)

  // 検索によるフィルタリング
  const filteredBuildings = buildings?.items.filter((b) =>
    b.name.toLowerCase().includes(searchValue.toLowerCase())
  ) || []

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg min-h-[250px] p-6">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>投稿の状態や建物を設定できます</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* 建物選択（Autocomplete） */}
          <div className="space-y-2">
            <Label>建物</Label>
            {isLoading ? (
              <div className="w-full border rounded-md p-2 text-gray-500">読み込み中...</div>
            ) : (
              <div ref={dropdownRef} className="relative">
                {/* 検索入力 */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder={selectedBuilding ? selectedBuilding.name : "建物名を入力して検索..."}
                    value={searchValue}
                    onChange={(e) => {
                      setSearchValue(e.target.value)
                      setIsDropdownOpen(true)
                    }}
                    onFocus={() => setIsDropdownOpen(true)}
                    className="w-full border rounded-md pl-10 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {searchValue && (
                    <button
                      onClick={() => {
                        setSearchValue("")
                        inputRef.current?.focus()
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* ドロップダウンリスト */}
                {isDropdownOpen && (
                  <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-[300px] overflow-y-auto">
                    {filteredBuildings.length === 0 ? (
                      <div className="py-6 text-center text-sm text-gray-500">
                        該当する建物が見つかりません
                      </div>
                    ) : (
                      <div className="py-1">
                        {filteredBuildings.map((b) => (
                          <div
                            key={b.id}
                            onClick={() => {
                              setFormData({ ...formData, buildingId: b.id })
                              setSearchValue("")
                              setIsDropdownOpen(false)
                            }}
                            className={cn(
                              "px-3 py-2 text-sm cursor-pointer hover:bg-gray-100",
                              b.id === formData.buildingId && "bg-blue-50 text-blue-600 font-medium"
                            )}
                          >
                            {b.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 選択された建物を表示 */}
                {selectedBuilding && !searchValue && (
                  <div className="mt-2 text-sm text-gray-600">
                    選択中: <span className="font-medium">{selectedBuilding.name}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 状態選択 */}
          <div className="space-y-2">
            <Label>状態</Label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as "confirming" | "approved" })}
              className="w-full border rounded-md p-2"
            >
              <option value="confirming">confirming</option>
              <option value="approved">approved</option>
            </select>
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