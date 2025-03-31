"use client";
import React, { useEffect, useState, ReactNode } from "react";
import { Loader2 } from "lucide-react";

interface LazyImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
}

export function LazyImage({
  src,
  alt,
  width,
  height,
  className = "",
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [imageSrc, setImageSrc] = useState("");

  useEffect(() => {
    setIsLoaded(false);

    const img = new Image();
    img.src = src;
    img.onload = () => {
      setImageSrc(src);
      setIsLoaded(true);
    };

    return () => {
      img.onload = null;
    };
  }, [src]);

  return (
    <div
      className={`relative ${className}`}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        overflow: "hidden",
      }}
    >
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#1a1a1a]">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      )}

      {imageSrc && (
        <img
          src={imageSrc}
          alt={alt}
          width={width}
          height={height}
          loading="lazy"
          className={`transition-opacity duration-300 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setIsLoaded(true)}
        />
      )}
    </div>
  );
}

interface LazyComponentProps {
  children: ReactNode;
  fallback?: ReactNode;
  threshold?: number;
}

export function LazyComponent({
  children,
  fallback = (
    <div className="flex items-center justify-center p-6">
      <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
    </div>
  ),
  threshold = 0.1,
}: LazyComponentProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasRendered, setHasRendered] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasRendered) {
          setIsVisible(true);
          setHasRendered(true);

          if (containerRef.current) {
            observer.unobserve(containerRef.current);
          }
        }
      },
      {
        root: null,
        rootMargin: "100px",
        threshold,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, [hasRendered, threshold]);

  return <div ref={containerRef}>{isVisible ? children : fallback}</div>;
}

export function useNetworkInfo() {
  const [connectionInfo, setConnectionInfo] = useState({
    isSlowConnection: false,
    connectionType: "unknown",
  });

  useEffect(() => {
    const connection =
      (navigator as any).connection ||
      (navigator as any).mozConnection ||
      (navigator as any).webkitConnection;

    if (connection) {
      const updateConnectionInfo = () => {
        const isSlowConnection =
          connection.saveData ||
          connection.effectiveType === "slow-2g" ||
          connection.effectiveType === "2g" ||
          connection.downlink < 0.5;

        setConnectionInfo({
          isSlowConnection,
          connectionType: connection.effectiveType || "unknown",
        });
      };

      updateConnectionInfo();

      connection.addEventListener("change", updateConnectionInfo);

      return () => {
        connection.removeEventListener("change", updateConnectionInfo);
      };
    }
  }, []);

  return connectionInfo;
}

export function NetworkAwareContent({
  children,
  lowBandwidthFallback,
}: {
  children: ReactNode;
  lowBandwidthFallback: ReactNode;
}) {
  const { isSlowConnection } = useNetworkInfo();

  if (isSlowConnection) {
    return <>{lowBandwidthFallback}</>;
  }

  return <>{children}</>;
}
