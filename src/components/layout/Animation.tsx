import type React from "react";

import { useState, useEffect, useRef } from "react";
import "../../App.css";

interface EnhancedAnimationProps {
	isActive: boolean;
	size?: string | number; // Accepts percentage (e.g., "50%") or fixed size (e.g., 150)
}

export default function EnhancedAnimation({
	isActive,
	size = "50%",
}: EnhancedAnimationProps) {
	const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
	const containerRef = useRef<HTMLDivElement>(null);
	const particlesRef = useRef<HTMLDivElement>(null);
	const [baseSize, setBaseSize] = useState(300); // Default base size in pixels
	const particleCount = 20;

	// Calculate the base size based on the size prop
	useEffect(() => {
		if (!containerRef.current) return;

		if (typeof size === "string" && size.endsWith("%")) {
			const percentage = parseFloat(size) / 100;
			setBaseSize(300 * percentage); // 300 is the original size
		} else if (typeof size === "number") {
			setBaseSize(size);
		} else {
			// Handle other cases (like "300px") if needed
			const parsedSize = parseInt(size, 10);
			if (!isNaN(parsedSize)) {
				setBaseSize(parsedSize);
			}
		}
	}, [size]);

	// Handle mouse movement for interactive effects
	const handleMouseMove = (e: React.MouseEvent) => {
		if (containerRef.current) {
			const rect = containerRef.current.getBoundingClientRect();
			setMousePosition({
				x: e.clientX - rect.left - rect.width / 2,
				y: e.clientY - rect.top - rect.height / 2,
			});
		}
	};

	// Generate random particles
	useEffect(() => {
		if (!particlesRef.current || !isActive) return;

		// Clear existing particles
		while (particlesRef.current.firstChild) {
			particlesRef.current.removeChild(particlesRef.current.firstChild);
		}

		// Create new particles
		for (let i = 0; i < particleCount; i++) {
			const particle = document.createElement("div");
			particle.className = "particle";

			// Random properties - scaled based on baseSize
			const size = Math.random() * (baseSize / 37.5) + baseSize / 150; // Original: 8 + 2
			const angle = Math.random() * Math.PI * 2;
			const distance = Math.random() * (baseSize / 2) + baseSize / 6; // Original: 150 + 50
			const duration = Math.random() * 8 + 4;
			const delay = Math.random() * 2;
			const opacity = Math.random() * 0.6 + 0.2;

			// Set styles
			particle.style.width = `${size}px`;
			particle.style.height = `${size}px`;
			particle.style.setProperty("--angle", `${angle}rad`);
			particle.style.setProperty("--distance", `${distance}px`);
			particle.style.setProperty("--duration", `${duration}s`);
			particle.style.setProperty("--delay", `${delay}s`);
			particle.style.setProperty("--opacity", `${opacity}`);

			particlesRef.current.appendChild(particle);
		}
	}, [isActive, baseSize]);

	// Calculate scaled values for all elements
	const getScaledValue = (originalValue: number) => {
		return (originalValue / 300) * baseSize; // 300 is the original base size
	};

	return (
		<div className="flex items-center justify-center min-h-screen">
			<div
				className="flex flex-col items-center gap-8"
				ref={containerRef}
				onMouseMove={handleMouseMove}
			>
				{/* Enhanced Animation Container */}
				<div
					className={`relative flex items-center justify-center animation-container ${
						isActive ? "active" : ""
					}`}
					style={{
						width: `${baseSize}px`,
						height: `${baseSize}px`,
						transform: isActive
							? `perspective(1000px) rotateX(${
									mousePosition.y * 0.01
							  }deg) rotateY(${mousePosition.x * 0.01}deg)`
							: "none",
						transition: "transform 0.1s ease-out",
					}}
				>
					{/* Particle container */}
					<div ref={particlesRef} className="particles-container" />

					{/* Outer glow rings */}
					<div
						className={`glow-ring glow-ring-1 ${isActive ? "active" : ""}`}
						style={{
							width: `${getScaledValue(140)}px`,
							height: `${getScaledValue(140)}px`,
						}}
					/>
					<div
						className={`glow-ring glow-ring-2 ${isActive ? "active" : ""}`}
						style={{
							width: `${getScaledValue(180)}px`,
							height: `${getScaledValue(180)}px`,
						}}
					/>
					<div
						className={`glow-ring glow-ring-3 ${isActive ? "active" : ""}`}
						style={{
							width: `${getScaledValue(220)}px`,
							height: `${getScaledValue(220)}px`,
						}}
					/>
					<div
						className={`glow-ring glow-ring-4 ${isActive ? "active" : ""}`}
						style={{
							width: `${getScaledValue(260)}px`,
							height: `${getScaledValue(260)}px`,
						}}
					/>
					<div
						className={`glow-ring glow-ring-5 ${isActive ? "active" : ""}`}
						style={{
							width: `${getScaledValue(300)}px`,
							height: `${getScaledValue(300)}px`,
						}}
					/>
					<div
						className={`glow-ring glow-ring-6 ${isActive ? "active" : ""}`}
						style={{
							width: `${getScaledValue(340)}px`,
							height: `${getScaledValue(340)}px`,
						}}
					/>

					{/* Pulse rings */}
					<div
						className={`pulse-ring pulse-ring-1 ${isActive ? "active" : ""}`}
						style={{
							width: `${getScaledValue(160)}px`,
							height: `${getScaledValue(160)}px`,
						}}
					/>
					<div
						className={`pulse-ring pulse-ring-2 ${isActive ? "active" : ""}`}
						style={{
							width: `${getScaledValue(200)}px`,
							height: `${getScaledValue(200)}px`,
						}}
					/>
					<div
						className={`pulse-ring pulse-ring-3 ${isActive ? "active" : ""}`}
						style={{
							width: `${getScaledValue(240)}px`,
							height: `${getScaledValue(240)}px`,
						}}
					/>

					{/* Energy waves */}
					<div
						className={`energy-wave energy-wave-1 ${isActive ? "active" : ""}`}
						style={{
							width: `${getScaledValue(180)}px`,
							height: `${getScaledValue(180)}px`,
						}}
					/>
					<div
						className={`energy-wave energy-wave-2 ${isActive ? "active" : ""}`}
						style={{
							width: `${getScaledValue(220)}px`,
							height: `${getScaledValue(220)}px`,
						}}
					/>
					<div
						className={`energy-wave energy-wave-3 ${isActive ? "active" : ""}`}
						style={{
							width: `${getScaledValue(260)}px`,
							height: `${getScaledValue(260)}px`,
						}}
					/>

					{/* Inner core elements */}
					<div
						className={`inner-core-container ${isActive ? "active" : ""}`}
						style={{
							width: `${getScaledValue(100)}px`,
							height: `${getScaledValue(100)}px`,
						}}
					>
						<div className="inner-core-glow" />
						<div
							className="inner-core"
							style={{
								width: `${getScaledValue(80)}px`,
								height: `${getScaledValue(80)}px`,
								top: `${getScaledValue(10)}px`,
								left: `${getScaledValue(10)}px`,
							}}
						/>
						<div
							className="inner-core-highlight"
							style={{
								width: `${getScaledValue(30)}px`,
								height: `${getScaledValue(30)}px`,
								top: `${getScaledValue(20)}px`,
								left: `${getScaledValue(20)}px`,
							}}
						/>
						<div className="inner-core-rings" />
					</div>

					{/* Central orb with 3D effect */}
					<div
						className={`central-orb ${isActive ? "active" : ""}`}
						style={{
							width: `${getScaledValue(80)}px`,
							height: `${getScaledValue(80)}px`,
						}}
					>
						<div
							className="orb-highlight"
							style={{
								width: `${getScaledValue(30)}px`,
								height: `${getScaledValue(30)}px`,
								top: `${getScaledValue(15)}px`,
								left: `${getScaledValue(15)}px`,
							}}
						/>
						<div className="orb-surface" />
						<div
							className="orb-depth"
							style={{
								width: `${getScaledValue(70)}px`,
								height: `${getScaledValue(70)}px`,
								top: `${getScaledValue(5)}px`,
								left: `${getScaledValue(5)}px`,
							}}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
