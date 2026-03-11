"use client"

import { useState, useRef, useCallback } from "react"

// ── MIME type negotiation ────────────────────────────────────────────────────
const PREFERRED_MIME_TYPES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/ogg;codecs=opus",
  "audio/ogg",
  "audio/mp4",
  "audio/wav",
]

function getSupportedMimeType(): string {
  if (typeof MediaRecorder === "undefined") return ""
  for (const mime of PREFERRED_MIME_TYPES) {
    if (MediaRecorder.isTypeSupported(mime)) {
      console.log(`[AudioRecorder] Using mime type: ${mime}`)
      return mime
    }
  }
  console.warn("[AudioRecorder] No preferred mime type supported, using browser default")
  return ""
}

// ── Hook ─────────────────────────────────────────────────────────────────────
interface UseAudioRecorderReturn {
  isRecording: boolean
  audioBlob: Blob | null
  audioUrl: string | null
  startRecording: () => Promise<void>
  stopRecording: () => Promise<Blob | null>
  error: string | null
}

export function useAudioRecorder(): UseAudioRecorderReturn {
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const resolveStopRef = useRef<((blob: Blob | null) => void) | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const startRecording = useCallback(async () => {
    try {
      setError(null)
      setAudioBlob(null)
      setAudioUrl(null)
      chunksRef.current = []

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
          channelCount: 1,
        },
      })
      streamRef.current = stream

      const mimeType = getSupportedMimeType()
      const options: MediaRecorderOptions = {}
      if (mimeType) options.mimeType = mimeType

      const mediaRecorder = new MediaRecorder(stream, options)
      console.log(`[AudioRecorder] Created recorder with mimeType: ${mediaRecorder.mimeType}`)

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data)
          console.log(`[AudioRecorder] Chunk: ${event.data.size} bytes`)
        }
      }

      mediaRecorder.onstop = () => {
        const chunks = chunksRef.current
        if (chunks.length === 0) {
          console.error("[AudioRecorder] No audio chunks captured!")
          setError("No audio data was captured. Please check your microphone.")
          setIsRecording(false)
          stream.getTracks().forEach((track) => track.stop())
          if (resolveStopRef.current) {
            resolveStopRef.current(null)
            resolveStopRef.current = null
          }
          return
        }

        const totalSize = chunks.reduce((sum, c) => sum + c.size, 0)
        console.log(`[AudioRecorder] Stop: ${chunks.length} chunks, ${totalSize} bytes total`)

        if (totalSize < 100) {
          console.error(`[AudioRecorder] Recording too small (${totalSize} bytes)`)
          setError("Recording too small — microphone may not be working.")
          setIsRecording(false)
          stream.getTracks().forEach((track) => track.stop())
          if (resolveStopRef.current) {
            resolveStopRef.current(null)
            resolveStopRef.current = null
          }
          return
        }

        // Use the recorder's actual mimeType for the blob (not hardcoded)
        const blobMime = mediaRecorder.mimeType || "audio/webm"
        const blob = new Blob(chunks, { type: blobMime })
        console.log(`[AudioRecorder] Final blob: ${blob.size} bytes, type: ${blob.type}`)

        setAudioBlob(blob)
        setAudioUrl(URL.createObjectURL(blob))
        setIsRecording(false)

        stream.getTracks().forEach((track) => track.stop())

        if (resolveStopRef.current) {
          resolveStopRef.current(blob)
          resolveStopRef.current = null
        }
      }

      mediaRecorder.onerror = (event) => {
        console.error("[AudioRecorder] Recorder error:", event)
        setError("Recording failed. Please try again.")
        setIsRecording(false)
      }

      mediaRecorderRef.current = mediaRecorder
      // Request data every 1 second to avoid losing data
      mediaRecorder.start(1000)
      setIsRecording(true)
    } catch (err: unknown) {
      console.error("[AudioRecorder] getUserMedia error:", err)
      if (err instanceof DOMException) {
        if (err.name === "NotAllowedError") {
          setError("Microphone access denied. Please allow microphone access and try again.")
        } else if (err.name === "NotFoundError") {
          setError("No microphone found. Please connect a microphone.")
        } else {
          setError(`Microphone error: ${err.message}`)
        }
      } else {
        setError("Microphone access is required for this exam. Please allow microphone access and try again.")
      }
    }
  }, [])

  const stopRecording = useCallback(async (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        resolveStopRef.current = resolve
        mediaRecorderRef.current.stop()
      } else {
        resolve(null)
      }
    })
  }, [])

  return {
    isRecording,
    audioBlob,
    audioUrl,
    startRecording,
    stopRecording,
    error,
  }
}
