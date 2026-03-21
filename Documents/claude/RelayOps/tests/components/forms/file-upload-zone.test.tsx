import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FileUploadZone } from '@/components/forms/file-upload-zone'

describe('FileUploadZone', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders drop zone with instruction text', () => {
    render(<FileUploadZone onFilesChange={vi.fn()} />)
    expect(screen.getByText(/drag & drop/i)).toBeInTheDocument()
    expect(screen.getByText(/click to browse/i)).toBeInTheDocument()
  })

  it('shows max files hint when maxFiles > 1', () => {
    render(<FileUploadZone onFilesChange={vi.fn()} maxFiles={5} />)
    expect(screen.getByText(/up to 5 files/i)).toBeInTheDocument()
  })

  it('calls onFilesChange when files are selected via input', async () => {
    const onFilesChange = vi.fn()
    render(<FileUploadZone onFilesChange={onFilesChange} maxFiles={3} />)

    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File(['hello'], 'test.txt', { type: 'text/plain' })

    // fireEvent로 파일 선택 시뮬레이션
    fireEvent.change(input, { target: { files: [file] } })

    expect(onFilesChange).toHaveBeenCalledWith([file])
  })

  it('displays selected file name after selection', () => {
    const onFilesChange = vi.fn()
    render(<FileUploadZone onFilesChange={onFilesChange} />)

    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File(['content'], 'report.pdf', { type: 'application/pdf' })

    fireEvent.change(input, { target: { files: [file] } })

    expect(screen.getByText('report.pdf')).toBeInTheDocument()
  })

  it('respects maxFiles limit and does not exceed it', () => {
    const onFilesChange = vi.fn()
    render(<FileUploadZone onFilesChange={onFilesChange} maxFiles={2} />)

    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    const files = [
      new File(['a'], 'a.txt', { type: 'text/plain' }),
      new File(['b'], 'b.txt', { type: 'text/plain' }),
      new File(['c'], 'c.txt', { type: 'text/plain' }),
    ]

    fireEvent.change(input, { target: { files } })

    // onFilesChange 最多传 2 个文件
    expect(onFilesChange).toHaveBeenCalledWith(expect.arrayContaining([files[0], files[1]]))
    const called = onFilesChange.mock.calls[0][0] as File[]
    expect(called).toHaveLength(2)
  })

  it('removes a file when the remove button is clicked', async () => {
    const user = userEvent.setup()
    const onFilesChange = vi.fn()
    render(<FileUploadZone onFilesChange={onFilesChange} />)

    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File(['data'], 'remove-me.txt', { type: 'text/plain' })

    fireEvent.change(input, { target: { files: [file] } })
    expect(screen.getByText('remove-me.txt')).toBeInTheDocument()

    // 删除按钮在文件列表 <li> 中，用 getAllByRole 取最后一个（X按钮）
    const buttons = screen.getAllByRole('button')
    const removeBtn = buttons[buttons.length - 1]
    await user.click(removeBtn)

    expect(screen.queryByText('remove-me.txt')).not.toBeInTheDocument()
    // 最后一次调用应为空数组
    const lastCall = onFilesChange.mock.calls.at(-1)![0] as File[]
    expect(lastCall).toHaveLength(0)
  })
})
