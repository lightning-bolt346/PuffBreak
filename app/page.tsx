export default function HomePage() {
  // The actual PuffBreakApp is rendered in the background globally by GlobalAppWrapper
  // This page just serves as a transparent dummy container for the root route.
  return (
    <div className="w-full h-full min-h-screen opacity-0 pointer-events-none" aria-hidden="true" />
  );
}
