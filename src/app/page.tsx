"use client";

import { useState, useRef, useCallback } from "react";
import { generateStyle, getStyles, swapStyle } from "@/lib/api";
import { Download } from "lucide-react";

// --- Helper Components ---

const Loader = () => {
	return (
		<section id="generating" className="center stack" style={{ gap: '1.5rem' }}>
			<p className="text-lg">Styling your scene…</p>
			<div className="shimmer-bar"></div>
		</section>
	);
};

// --- Main Page Component ---

export default function Home() {
	const [appState, setAppState] = useState("welcome");
	const [imageFile, setImageFile] = useState<File | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const [generatedImages, setGeneratedImages] = useState<string[]>([]);
	const [styles, setStyles] = useState<string[]>([]);
	const [sessionId, setSessionId] = useState<string | null>(null);
	const [destination, setDestination] = useState("");
	const [event, setEvent] = useState("");
	const [theme, setTheme] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [isDragging, setIsDragging] = useState(false);
	const [currentSlide, setCurrentSlide] = useState(0);

	const fileInputRef = useRef<HTMLInputElement>(null);
	const carouselRef = useRef<HTMLDivElement>(null);

	const handleFile = useCallback(async (file: File) => {
		if (!file || !file.type.startsWith("image/")) return;
		let processedFile = file;
		if (file.type === "image/heic" || file.name.toLowerCase().endsWith(".heic")) {
			try {
				const heic2any = (await import("heic2any")).default;
				const convertedBlob = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.8 });
				processedFile = new File([convertedBlob as Blob], file.name.replace(/\.[^/.]+$/, ".jpg"), { type: "image/jpeg" });
			} catch (error) {
				console.error("Error converting HEIC image:", error);
				return;
			}
		}
		setImageFile(processedFile);
		setPreviewUrl(URL.createObjectURL(processedFile));
		setAppState("input");
	}, []);

	const handleGenerate = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!imageFile) return;
		setAppState("generating");
		try {
			const { sessionId, imageUrl } = await generateStyle(imageFile, event, destination, theme);
			setSessionId(sessionId);
			const fetchedStyles = await getStyles(sessionId);
			setStyles(fetchedStyles);
			const initialImages = new Array(fetchedStyles.length).fill(null);
			initialImages[0] = imageUrl;
			setGeneratedImages(initialImages);
			setAppState("result");
		} catch (error) {
			console.error("Error generating style:", error);
			setAppState("input");
		}
	};

	const handleStyleSwap = useCallback(async (index: number) => {
		if (!sessionId || generatedImages[index]) return;
		setIsLoading(true);
		try {
			const { imageUrl } = await swapStyle(sessionId, index);
			setGeneratedImages((prevImages) => {
				const newImages = [...prevImages];
				newImages[index] = imageUrl;
				return newImages;
			});
		} catch (error) {
			console.error("Error swapping style:", error);
		} finally {
			setIsLoading(false);
		}
	}, [sessionId, generatedImages]);

	const scrollToSlide = (index: number) => {
		setCurrentSlide(index);
		handleStyleSwap(index);
		if (carouselRef.current) {
			const slideWidth = carouselRef.current.offsetWidth;
			carouselRef.current.scrollTo({ left: slideWidth * index, behavior: 'smooth' });
		}
	};

	const handleDownload = () => {
		const url = generatedImages[currentSlide];
		if (!url) return;
		const a = document.createElement("a");
		a.href = url;
		a.download = `drape-style-${currentSlide + 1}.png`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	};

	const handleStartOver = () => {
		setAppState("welcome");
		setImageFile(null);
		setPreviewUrl(null);
		setGeneratedImages([]);
		setStyles([]);
		setSessionId(null);
		setDestination("");
		setEvent("");
		setTheme("");
		setCurrentSlide(0);
	};

	const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
	const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);
		if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
	};

	return (
		<main id="app" className="container">
			{appState === "welcome" && (
				<section id="welcome" className="center stack">
					<h1 style={{ fontSize: "2rem" }}>Your Trip, Styled</h1>
					<p>Get Google AI powered outfit suggestions for your voyage and try them on instantly</p>
					<div
						className={`dropzone ${isDragging ? "drag" : ""}`}
						onClick={() => fileInputRef.current?.click()}
						onDragOver={handleDragOver}
						onDragLeave={handleDragLeave}
						onDrop={handleDrop}
					>
						<input type="file" accept="image/*,.heic" hidden ref={fileInputRef} onChange={(e) => e.target.files && handleFile(e.target.files[0])} />
						<span>Drag & Drop Your Photo</span>
						<button className="btn btn-primary">or Browse</button>
					</div>
				</section>
			)}

			{appState === "input" && previewUrl && (
				<section id="input" className="two-col">
					<div className="stack">
						<img id="preview" alt="your photo" src={previewUrl} />
					</div>
					<form className="stack" id="controls" onSubmit={handleGenerate}>
						<label>Destination</label>
						<input value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="e.g., Paris, France" className="btn" style={{ width: '100%' }} />
						<label>Event</label>
						<input value={event} onChange={(e) => setEvent(e.target.value)} placeholder="e.g., Museum Visit" className="btn" style={{ width: '100%' }} />
						<label>Theme</label>
						<input value={theme} onChange={(e) => setTheme(e.target.value)} placeholder="e.g., Artistic, Chic" className="btn" style={{ width: '100%' }} />
						<button type="submit" className="btn btn-primary">Generate Style</button>
					</form>
				</section>
			)}

			{appState === "generating" && <Loader />}

			{appState === "result" && (
				<section id="result" className="stack items-center">
					<div className="simple-carousel-container">
						<div className="simple-carousel" ref={carouselRef}>
							{styles.map((_, index) => (
								<div key={index} className="simple-carousel-slide">
									{isLoading && index === currentSlide && !generatedImages[index] ? (
										<div className="spinner"></div>
									) : generatedImages[index] ? (
										<img src={generatedImages[index]} alt={`Styled look ${index + 1}`} />
									) : null}
								</div>
							))}
						</div>
						<button className="simple-carousel-nav prev" onClick={() => scrollToSlide((currentSlide - 1 + styles.length) % styles.length)}>‹</button>
						<button className="simple-carousel-nav next" onClick={() => scrollToSlide((currentSlide + 1) % styles.length)}>›</button>
					</div>
					<div className="dots">
						{styles.map((_, i) => (
							<span key={i} className={i === currentSlide ? "active" : ""} onClick={() => scrollToSlide(i)} />
						))}
					</div>
					<div className="action-bar cluster">
						<button className="icon-btn" aria-label="download" onClick={handleDownload}>
							<Download size={20} />
						</button>
					</div>
					<div className="center">
						<a href="#" className="link" onClick={(e) => { e.preventDefault(); handleStartOver(); }}>Start Over</a>
					</div>
				</section>
			)}
		</main>
	);
}
