import React, { useState, useEffect } from 'react'
import { TriangleRightIcon } from '@radix-ui/react-icons'
import { CSSProperties } from 'react'

interface FileSystemEntry {
  children?: FileSystemEntry[]
  name: string
  type: 'file' | 'directory'
  isOpen?: boolean
  path: string
}

interface APIResponse {
  id: string
  entries?: FileSystemEntry[]
  contents?: string
}

const FileBrowser: React.FC<{ apiUrl: string }> = ({ apiUrl }) => {
  const [fileSystem, setFileSystem] = useState<FileSystemEntry[]>([
    {
      name: 'root',
      type: 'directory',
      isOpen: true,
      path: 'root',
      children: []
    }
  ])
  const [fileContent, setFileContent] = useState<string | null>(null)

  useEffect(() => {
    fetchFileSystem('root')
  }, [apiUrl])

  const fetchFileSystem = (path: string = 'root') => {
    fetch(`${apiUrl}fs?path=${encodeURIComponent(path)}`)
      .then(response => response.json())
      .then((data: APIResponse) => {
        const updatedEntries =
          data.entries?.map(entry => ({
            ...entry,
            isOpen: false,
            path: path === 'root' ? entry.name : `${path}/${entry.name}`
          })) || []

        if (path === 'root') {
          setFileSystem(prevState =>
            prevState.map(root => ({
              ...root,
              children: updatedEntries
            }))
          )
        } else {
          const newFileSystem = updateFileSystem(
            fileSystem,
            path,
            updatedEntries
          )
          setFileSystem(newFileSystem)
        }
      })
      .catch(error => console.error('Error fetching data:', error))
  }

  const handleItemClick = (entry: FileSystemEntry) => {
    if (entry.type === 'directory') {
      entry.isOpen = !entry.isOpen
      if (entry.isOpen && !entry.children?.length) {
        fetchFileSystem(entry.path)
      }
    } else {
      setFileContent(entry.path) // Here, you might want to display the actual content instead of the path
    }
    setFileSystem([...fileSystem])
  }

  const updateFileSystem = (
    entries: FileSystemEntry[],
    path: string,
    children: FileSystemEntry[]
  ): FileSystemEntry[] => {
    return entries.map(entry => {
      if (entry.path === path) {
        return { ...entry, children }
      } else if (entry.type === 'directory' && entry.children) {
        return {
          ...entry,
          children: updateFileSystem(entry.children, path, children)
        }
      }
      return entry
    })
  }

  const renderFileSystem = (
    entries: FileSystemEntry[] | undefined,
    depth = 0
  ) => {
    return entries?.map((entry, index) => (
      <div
        key={index}
        className='py-2'
        style={{ paddingLeft: `${depth * 20}px` }}
      >
        <div
          onClick={() => handleItemClick(entry)}
          className={`cursor-pointer min-w-[10rem] flex items-center ${
            entry.type === 'directory' ? 'font-bold' : ''
          }`}
          style={{ display: 'flex', alignItems: 'center' }}
        >
          {entry.type === 'directory' && (
            <TriangleRightIcon
              style={
                {
                  transform: entry.isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s',
                  marginRight: '5px'
                } as CSSProperties
              }
            />
          )}
          {entry.name}
        </div>
        {entry.isOpen && renderFileSystem(entry.children, depth + 1)}
      </div>
    ))
  }

  return (
    <div className='file-browser h-[50vh] w-[300px] space-y-2'>
      {renderFileSystem(fileSystem)}
      {fileContent && (
        <div className='fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center'>
          <div className='bg-white p-4 rounded-[20px] w-[300px] h-[150px] flex flex-col justify-center'>
            <p className='text-black text-center'>{fileContent}</p>
            <button
              onClick={() => setFileContent(null)}
              className='mt-4 bg-indigo-500 hover:bg-indigo-700 transition-all text-white font-bold py-2 px-4 rounded-xl w-1/2 self-center'
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default FileBrowser
