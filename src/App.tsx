import FileBrowser from './components/FileBrowser'

const App = () => {
  return (
    <main className='w-screen h-[80vh] flex flex-col justify-start items-center gap-6'>
      <h1 className='text-3xl font-bold'>File Browser</h1>
      <p className='text-sm text-gray-500'>
        Made with <span className='text-red-500'>❤</span> by Kyle
      </p>
      <FileBrowser apiUrl='http://localhost:8080/' />
    </main>
  )
}

export default App
