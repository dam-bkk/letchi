import { Footer } from "@/components/footer";
import { Hero } from "@/components/hero";
import { Nav } from "@/components/nav";
import { Products } from "@/components/products";
import { Why } from "@/components/why";

export default function Home() {
  return (
    <>
      <Nav />
      <main className="flex flex-1 flex-col">
        <Hero />
        <Products />
        <Why />
      </main>
      <Footer />
    </>
  );
}
