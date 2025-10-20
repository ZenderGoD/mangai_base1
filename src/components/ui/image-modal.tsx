"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Download, ZoomIn, ZoomOut, RotateCw } from "lucide-react";
import Image from "next/image";

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title?: string;
  description?: string;
}

export function ImageModal({ isOpen, onClose, imageUrl, title, description }: ImageModalProps) {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 300));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 25));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);
  const handleReset = () => {
    setZoom(100);
    setRotation(0);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = title ? `${title.replace(/\s+/g, '_')}.png` : 'image.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 bg-black/95 border-white/20 z-[9999]">
        <DialogHeader className="p-6 pb-4 border-b border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              {title && (
                <DialogTitle className="text-white text-lg font-semibold">
                  {title}
                </DialogTitle>
              )}
              {description && (
                <p className="text-white/70 text-sm mt-1">
                  {description}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <div className="relative w-full h-full min-h-[400px] flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
            <div
              className="relative transition-all duration-200 ease-in-out cursor-pointer"
              style={{
                transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                maxWidth: '90%',
                maxHeight: '90%',
              }}
              onClick={handleBackdropClick}
            >
              <Image
                src={imageUrl}
                alt={title || "Generated image"}
                width={800}
                height={800}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                unoptimized
              />
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="p-6 pt-4 border-t border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomOut}
                disabled={zoom <= 25}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              
              <span className="text-white text-sm font-medium min-w-[60px] text-center">
                {zoom}%
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomIn}
                disabled={zoom >= 300}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleRotate}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 ml-2"
              >
                <RotateCw className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                Reset
              </Button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="bg-blue-500/20 border-blue-500/30 text-blue-200 hover:bg-blue-500/30"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
