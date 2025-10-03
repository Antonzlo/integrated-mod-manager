function Page1({ setPage }: { setPage: (page: number) => void }) {
	const wuwaText = "WuWa";
	const modManagerText = "Mod Manager";
	return (
		<>
			<div
				className='text-muted-foreground fixed flex flex-col items-center justify-center w-screen h-screen'
				onClick={() => {
					console.log("clicked");
					setPage(1);
				}}
				>
					<div className="mb-4 text-3xl">Welcome to</div>
				<div className="text-8xl text-foreground flex">
					{wuwaText.split('').map((letter, index) => (
						<span
							key={index}
							className="wave-letter"
							style={{
								animationDelay: `${index * 0.1}s`
							}}
						>
							{letter}
						</span>
					))}
				</div>
				<div className=" text-accent flex text-4xl">
					{modManagerText.split('').map((letter, index) => (
						<span
							key={index}
							className="wave-letter"
							style={{
								animationDelay: `${(index + wuwaText.length) * 0.1}s`
							}}
						>
							{letter === ' ' ? '\u00A0' : letter}
						</span>
					))}
				</div>
				<div className="text-muted-foreground/50 mt-16">Click anywhere to start the tutorial</div>
			</div>
		</>
	);
}
export default Page1;
