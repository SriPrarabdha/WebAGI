import Nav from '../components/Nav';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="">
      <Nav />
      <main className="py-15 bg-std-pattern grid grid-rows-4 items-center justify-between bg-white bg-center p-2 pt-20 md:min-h-screen  md:grid-cols-5 md:grid-rows-1">
        <div className="hidden md:col-span-1 md:block ">
          <Image src={'/Images/img2.png'} width={300} height={50} alt="Robot" />
        </div>
        <div className="row-span-4 flex-1 items-end justify-center py-10 md:col-span-3 md:flex md:h-full md:items-center md:justify-center">
          <div className="">
            <h1 className="text-center text-4xl font-semibold lg:text-5xl xl:text-7xl">
              Meet your new
            </h1>

            <h1 className="pt-1 text-center text-4xl font-semibold md:pt-3 lg:text-5xl xl:text-7xl">
              AI legal assistant
            </h1>
            <p className="p-2 py-10 text-center font-medium text-gray-500 md:text-xl xl:text-2xl">
              Legal Brain does have features like LawGPT, chat with a bot,
              transliteration, and drafting with results you can trust.
            </p>
            <div className="flex w-full items-center justify-center">
              <Link
                role="button"
                href={'#'}
                className="items-center rounded-full border bg-blue-600 px-6 py-4 text-sm font-bold  text-white hover:bg-blue-900"
              >
                Request Demo
              </Link>
            </div>
          </div>
        </div>
        <div className="row-span-1 grid grid-cols-2 items-center md:col-span-1 md:grid-cols-1">
          <div className="mx-auto flex items-center md:hidden">
            <Image
              src={'/Images/img2.png'}
              width={300}
              height={50}
              alt="Robot"
              className="z-0"
            />
          </div>

          <div className="mx-auto flex items-center">
            <Image
              src={'/Images/img1.png'}
              width={300}
              height={50}
              alt="Robot"
              className="z-0"
            />
          </div>
        </div>
      </main>
      <main className="flex min-h-full flex-col items-center justify-between bg-white pt-5">
        <div className="px- pb-10 ">
          <h1 className="pt-1 text-center text-xl font-semibold md:pt-3 lg:text-3xl xl:text-5xl">
            Introducing LawGPT, India’s first reliable AI legal assistant
          </h1>
          <p className="p-2 text-center text-xs font-medium text-gray-500 md:text-xl xl:text-2xl">
            Let LawGPT handle your legal questions, provide insightful
            information, and assist you with legal discussions.
          </p>
        </div>
        <div className="px-2 md:px-4">
          <Image
            src={'/Images/img3.png'}
            width={1000}
            height={50}
            alt="Robot"
          />
        </div>
      </main>
      <main className="flex min-h-full flex-col items-center justify-between bg-white pt-20">
        <div className="px-4 pb-10">
          <h1 className="pb-5 pt-1 text-center text-xl font-semibold md:pt-3 md:text-3xl lg:text-3xl xl:text-5xl">
            Our Features & Services
          </h1>
          <div className="grid grid-cols-6 grid-rows-2 gap-2 md:gap-4 md:pt-4">
            <Link
              role="button"
              href={'#'}
              className="col-span-2 items-center rounded-full border border-blue-600 px-2 py-1 text-xs font-semibold hover:bg-slate-300 md:px-4 md:py-2 md:text-base"
            >
              LawGPT
            </Link>
            <Link
              role="button"
              href={'#'}
              className="col-span-2 items-center rounded-full border border-blue-600 px-2 py-1 text-xs font-semibold hover:bg-slate-300 md:px-4 md:py-2 md:text-base"
            >
              Drafting
            </Link>
            <Link
              role="button"
              href={'#'}
              className="col-span-2 items-center rounded-full border border-blue-600 px-2 py-1 text-xs font-semibold hover:bg-slate-300 md:px-4 md:py-2 md:text-base"
            >
              Chat with a bot
            </Link>
            <Link
              role="button"
              href={'#'}
              className="col-span-2 items-center rounded-full border border-blue-600 px-2 py-1 text-xs font-semibold hover:bg-slate-300 md:px-4 md:py-2 md:text-base"
            >
              Transliteration
            </Link>
            <Link
              role="button"
              href={'#'}
              className="col-span-4 items-center rounded-full border border-blue-600 px-2 py-1 text-xs font-semibold hover:bg-slate-300 md:px-4 md:py-2 md:text-base"
            >
              Trademark & IP Management
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 md:pt-16">
          <div className="px-4 pb-4 md:pt-16">
            <h1 className="pb-5 pt-1 text-center text-base font-semibold md:px-10 md:pt-3 md:text-2xl lg:text-3xl xl:text-5xl">
              From idea to launch - and every feature in between
            </h1>
            <div className="flex rounded border bg-white p-2 px-4 md:mt-16">
              <div className="relative my-auto h-8 w-8">
                <Image src={'/Logo/one.png'} fill alt="Robot" className="" />
              </div>
              <p className="pl-4 text-xs font-semibold">
                1. Create an account or logs into an existing account.
              </p>
            </div>
            <div className="bgwhite my-6 flex rounded border p-2 px-4">
              <div className="relative my-auto h-8 w-9">
                <Image src={'/Logo/two.png'} fill alt="Robot" className="" />
              </div>
              <p className="pl-4 text-xs font-semibold">
                2. Define a goal or task, and formulate a request or quory.
              </p>
            </div>
            <div className="flex rounded border bg-white p-2 px-4">
              <div className="relative my-auto h-8 w-12">
                <Image src={'/Logo/three.png'} fill alt="Robot" className="" />
              </div>
              <p className="pl-4 text-xs font-semibold">
                3. LawGPT process the input and generates a output based on your
                request.
              </p>
            </div>
            <div className="mt-6 flex w-full items-center justify-center">
              <Link
                role="button"
                href={'#'}
                className="items-center rounded-full border bg-blue-600 px-6 py-4 text-sm font-bold  text-white hover:bg-blue-900"
              >
                Request Demo
              </Link>
            </div>
          </div>

          <div className="flex h-full w-full justify-end">
            <Image
              src={'/Images/img4.png'}
              width={400}
              height={50}
              alt="Half Screen"
              className="hidden md:block"
            />
          </div>
        </div>
      </main>
    </div>
  );
}
