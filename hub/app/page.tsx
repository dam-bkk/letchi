import { Flagship } from "@/components/flagship";
import { Footer } from "@/components/footer";
import { Hero } from "@/components/hero";
import { Nav } from "@/components/nav";
import { Products } from "@/components/products";
import { Why } from "@/components/why";

// Cloudflare pins SSG HTML (s-maxage=1y) — force periodic revalidation.
export const revalidate = 3600;

export default function Home() {
  return (
    <>
      <Nav />
      <main className="flex flex-1 flex-col">
        <Hero />
        <Flagship />
        <Products />
        <Why />
      </main>
      <Footer />
    </>
  );
}
