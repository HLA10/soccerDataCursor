"use client"

import React, { useState, useCallback, useEffect, useRef } from "react"
import Cropper from "react-easy-crop"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"

interface ImageCropperProps {
  image: string
  onCropComplete: (croppedImage: string) => void
  onCancel: () => void
}

interface Area {
  x: number
  y: number
  width: number
  height: number
}

interface Point {
  x: number
  y: number
}

// Utility function to create cropped image
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener("load", () => resolve(image))
    image.addEventListener("error", (error) => reject(error))
    image.src = url
  })

const getRadianAngle = (degreeValue: number) => {
  return (degreeValue * Math.PI) / 180
}

const rotateSize = (width: number, height: number, rotation: number) => {
  const rotRad = getRadianAngle(rotation)
  return {
    width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  }
}

const getCroppedImg = async (
  imageSrc: string,
  pixelCrop: Area,
  rotation = 0
): Promise<string> => {
  const image = await createImage(imageSrc)
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")

  if (!ctx) {
    throw new Error("No 2d context")
  }

  const rotRad = getRadianAngle(rotation)
  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
    image.width,
    image.height,
    rotation
  )

  canvas.width = bBoxWidth
  canvas.height = bBoxHeight

  ctx.translate(bBoxWidth / 2, bBoxHeight / 2)
  ctx.rotate(rotRad)
  ctx.scale(1, 1)
  ctx.translate(-image.width / 2, -image.height / 2)

  ctx.drawImage(image, 0, 0)

  const data = ctx.getImageData(pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height)

  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height

  ctx.putImageData(data, 0, 0)

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Canvas is empty"))
          return
        }
        const reader = new FileReader()
        reader.addEventListener("load", () => resolve(reader.result as string))
        reader.addEventListener("error", reject)
        reader.readAsDataURL(blob)
      },
      "image/jpeg",
      0.85
    )
  })
}

export function ImageCropper({ image, onCropComplete, onCancel }: ImageCropperProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [hasInitialized, setHasInitialized] = useState(false)
  const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const isFirstCropChange = useRef(true)

  // Reset state when image changes
  useEffect(() => {
    // Don't reset crop position - let the library calculate center on remount
    // The key prop will force remount, and library will auto-center
    setZoom(1)
    setCroppedAreaPixels(null)
    setHasInitialized(false)
    setIsProcessing(false)
    setImageSize(null)
    isFirstCropChange.current = true
  }, [image])

  // Handle window resize for better responsiveness
  useEffect(() => {
    const handleResize = () => {
      // Force cropper to recalculate on resize
      if (containerRef.current && imageSize && hasInitialized) {
        // Trigger a slight delay to allow resize to complete
        setTimeout(() => {
          // The cropper should automatically adjust, but we can force a refresh
          if (croppedAreaPixels) {
            // Re-trigger crop complete to recalculate
            setHasInitialized(false)
            setTimeout(() => setHasInitialized(true), 50)
          }
        }, 100)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [imageSize, hasInitialized, croppedAreaPixels])

  const onCropChange = useCallback((newCrop: Point) => {
    setCrop(newCrop)
    // On the first crop change after image load, this should be the centered position from the library
    if (isFirstCropChange.current && imageSize) {
      isFirstCropChange.current = false
      if (!hasInitialized) {
        setHasInitialized(true)
      }
    }
  }, [imageSize, hasInitialized])

  const onZoomChange = useCallback((zoom: number) => {
    setZoom(zoom)
  }, [])

  const onCropCompleteCallback = useCallback(
    (_croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels)
      if (!hasInitialized) {
        setHasInitialized(true)
      }
    },
    [hasInitialized]
  )

  const onMediaLoaded = useCallback((mediaSize: { width: number; height: number }) => {
    setImageSize(mediaSize)
    // Library will calculate center and call onCropChange with the centered position
  }, [])

  const handleApply = async () => {
    if (!croppedAreaPixels || isProcessing) {
      return
    }

    setIsProcessing(true)

    try {
      // First, get the cropped rectangular image
      const croppedImage = await getCroppedImg(image, croppedAreaPixels)

      // Then, create a circular version
      const circularImage = await createCircularImage(croppedImage)
      onCropComplete(circularImage)
    } catch (error) {
      console.error("Error cropping image:", error)
      alert("Failed to process image. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const createCircularImage = (imageSrc: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
    const size = 200
        const canvas = document.createElement("canvas")
    canvas.width = size
    canvas.height = size
        const ctx = canvas.getContext("2d")

        if (!ctx) {
          reject(new Error("Failed to get canvas context"))
          return
        }

        // Create circular clipping path
    ctx.beginPath()
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2)
    ctx.closePath()
    ctx.clip()

        // Draw the image centered and scaled to fit
        const scale = Math.max(size / img.width, size / img.height)
        const x = (size - img.width * scale) / 2
        const y = (size - img.height * scale) / 2

        ctx.drawImage(img, x, y, img.width * scale, img.height * scale)

        // Convert to base64
        const base64 = canvas.toDataURL("image/jpeg", 0.85)
        resolve(base64)
      }
      img.onerror = reject
      img.src = imageSrc
    })
  }

  const canApply = croppedAreaPixels !== null && hasInitialized && !isProcessing

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex flex-col">
      {/* Cropper Area */}
      <div 
        ref={containerRef}
        className="flex-1 relative min-h-0" 
        style={{ touchAction: "none", userSelect: "none" }}
      >
        <Cropper
          key={image}
          image={image}
          crop={crop}
          zoom={zoom}
          aspect={1}
          cropShape="round"
          showGrid={false}
          restrictPosition={true}
          onCropChange={onCropChange}
          onZoomChange={onZoomChange}
          onCropComplete={onCropCompleteCallback}
          onMediaLoaded={onMediaLoaded}
        />
      </div>

      {/* Controls - Make responsive */}
      <div className="bg-slate-900 p-3 sm:p-4 space-y-3 sm:space-y-4 flex-shrink-0">
        {/* Zoom Slider */}
        <div className="flex items-center gap-2 sm:gap-4 max-w-md mx-auto">
          <span className="text-white text-xs w-8 sm:w-12">Zoom</span>
          <Slider
            value={[zoom]}
            min={0.1}
            max={3}
            step={0.05}
            onValueChange={(value) => setZoom(value[0])}
            className="flex-1"
          />
          <span className="text-white text-xs w-8 sm:w-10 text-right">{Math.round(zoom * 100)}%</span>
        </div>

        {/* Buttons */}
        <div className="flex justify-center gap-2 sm:gap-4">
          <Button
            variant="outline"
            onClick={onCancel}
            className="bg-transparent text-white border-white hover:bg-white/10 text-sm sm:text-base"
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            onClick={handleApply}
            className="bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-sm sm:text-base"
            disabled={!canApply}
          >
            {isProcessing ? "Processing..." : "Apply"}
          </Button>
        </div>
      </div>
    </div>
  )
}

interface PhotoUploadProps {
  currentPhoto?: string
  onPhotoChange: (photo: string) => void
}

export function PhotoUpload({ currentPhoto, onPhotoChange }: PhotoUploadProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [showCropper, setShowCropper] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) {
      return
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file")
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be less than 5MB")
      return
    }

    setIsLoading(true)

    const reader = new FileReader()
    reader.onerror = () => {
      setIsLoading(false)
      alert("Failed to read image file. Please try again.")
    }
    reader.onload = (event) => {
      const result = event.target?.result
      if (result && typeof result === "string") {
        setSelectedImage(result)
      setShowCropper(true)
        setIsLoading(false)
      } else {
        setIsLoading(false)
        alert("Failed to load image. Please try again.")
      }
    }
    reader.readAsDataURL(file)
  }, [])

  const handleClick = useCallback(() => {
    if (!isLoading) {
      fileInputRef.current?.click()
  }
  }, [isLoading])

  const handleCropComplete = useCallback(
    (croppedImage: string) => {
    onPhotoChange(croppedImage)
    setShowCropper(false)
    setSelectedImage(null)
    },
    [onPhotoChange]
  )

  const handleCancel = useCallback(() => {
    setShowCropper(false)
    setSelectedImage(null)
  }, [])

  return (
    <>
      <div className="flex flex-col items-center gap-3">
        {/* Photo Preview */}
        <div
          className="relative group cursor-pointer"
          onClick={handleClick}
          style={{ opacity: isLoading ? 0.6 : 1 }}
        >
          {currentPhoto ? (
            <img
              src={currentPhoto}
              alt="Club Logo"
              className="w-24 h-24 rounded-full object-contain ring-4 ring-slate-100 bg-white"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center ring-4 ring-slate-100">
              {isLoading ? (
                <span className="text-lg text-white">...</span>
              ) : (
              <span className="text-3xl text-white">+</span>
              )}
            </div>
          )}
          
          {/* Overlay on hover */}
          {!isLoading && (
            <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white text-xs font-medium">
                {currentPhoto ? "Change" : "Upload"}
              </span>
            </div>
          )}

            <input
            ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
        </div>

        <p className="text-xs text-muted-foreground">
          {isLoading ? "Loading..." : `Click to ${currentPhoto ? "change" : "upload"} photo`}
        </p>
      </div>

      {/* Cropper Modal */}
      {showCropper && selectedImage && (
        <ImageCropper
          image={selectedImage}
          onCropComplete={handleCropComplete}
          onCancel={handleCancel}
        />
      )}
    </>
  )
}
