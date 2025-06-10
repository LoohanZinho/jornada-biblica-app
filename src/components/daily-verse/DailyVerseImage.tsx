
"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { generateImageFromQuestion } from '@/ai/flows/generate-image-from-question';
import { LoadingIndicator } from '@/components/common/LoadingIndicator';
import { AlertCircle } from 'lucide-react';

interface DailyVerseImageProps {
  prompt: string;
  altText: string;
  imageHint?: string; // For data-ai-hint on placeholder
}

export function DailyVerseImage({ prompt, altText, imageHint }: DailyVerseImageProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const isMountedRef = useRef(true);
  const currentPromptRef = useRef<string | null>(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!prompt || prompt === currentPromptRef.current) {
      // Avoid refetching if prompt hasn't changed or is empty
      // If prompt is empty and we are not loading, set error or do nothing
      if (!prompt && !isLoading) {
        setError(true);
        setIsLoading(false);
      }
      return;
    }

    currentPromptRef.current = prompt;
    setIsLoading(true);
    setError(false);
    setImageUrl(null);

    generateImageFromQuestion({ questionText: prompt })
      .then(response => {
        if (isMountedRef.current && currentPromptRef.current === prompt) {
          setImageUrl(response.imageUrl);
        }
      })
      .catch(err => {
        console.error("Erro ao gerar imagem para o versículo:", err);
        if (isMountedRef.current && currentPromptRef.current === prompt) {
          setError(true);
        }
      })
      .finally(() => {
        if (isMountedRef.current && currentPromptRef.current === prompt) {
          setIsLoading(false);
        }
      });
  }, [prompt, isLoading]); // Added isLoading to dependency array to handle retries or subsequent calls correctly

  return (
    <div className="aspect-video w-full relative overflow-hidden rounded-lg shadow-md bg-muted">
      {isLoading && <LoadingIndicator text="Gerando ilustração inspiradora..." className="absolute inset-0" />}
      {error && !isLoading && (
        <div className="w-full h-full flex flex-col items-center justify-center bg-secondary">
          <AlertCircle className="w-16 h-16 text-destructive mb-2" />
          <p className="text-sm text-destructive-foreground px-4 text-center">Não foi possível carregar a ilustração para este versículo.</p>
          <Image 
            src={`https://placehold.co/600x400.png`} 
            alt="Erro ao carregar ilustração" 
            layout="fill" 
            objectFit="cover" 
            data-ai-hint={imageHint || "sacred scroll"}
            className="opacity-20"
          />
        </div>
      )}
      {!isLoading && !error && imageUrl && (
        <Image 
          src={imageUrl} 
          alt={altText} 
          layout="fill" 
          objectFit="cover" 
          data-ai-hint={imageHint || "spiritual illustration"}
        />
      )}
      {/* Fallback for when no prompt is given initially, or if all else fails before first load */}
      {!isLoading && !error && !imageUrl && !prompt && (
         <Image 
            src={`https://placehold.co/600x400.png`} 
            alt="Ilustração para o versículo" 
            layout="fill" 
            objectFit="cover" 
            data-ai-hint={imageHint || "bible verse"}
          />
      )}
    </div>
  );
}
