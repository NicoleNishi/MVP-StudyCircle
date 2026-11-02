import CirculosDecorativos from "../layout/CirculosDecorativos";
import Logo from "../layout/Logo";

export default function AuthLayout({ titulo, children }) {
  return (
    <div className="relative isolate grid min-h-screen grid-rows-[auto_1fr] lg:grid-rows-1">
      <CirculosDecorativos variante="entrada" />

      <header className="flex justify-end px-6 pt-6 sm:px-12.5 sm:pt-10 lg:col-start-1 lg:row-start-1 lg:self-start">
        <Logo />
      </header>

      <main className="flex items-center justify-center px-4 py-8 lg:col-start-1 lg:row-start-1 lg:py-15">
        <section
          aria-labelledby="titulo-entrada"
          className="w-full max-w-107.5 rounded-cartao bg-white px-5 py-10 shadow-[0_1px_3px_#0000000d] sm:px-4.5 sm:pb-11 sm:pt-10"
        >
          <h1 id="titulo-entrada" className="mb-6 text-center text-[40px] font-medium leading-12 text-black">
            {titulo}
          </h1>
          {children}
        </section>
      </main>
    </div>
  );
}