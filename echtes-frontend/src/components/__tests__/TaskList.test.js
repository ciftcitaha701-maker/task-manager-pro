import { describe, it, expect, vi, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import TaskList from '../TaskList.vue'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('TaskList', () => {
  it('zeigt einen Hinweis, wenn keine Aufgaben vorhanden sind', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    }))

    const wrapper = mount(TaskList)
    await flushPromises()

    expect(wrapper.text()).toContain('Noch keine Aufgaben vorhanden.')
  })

  it('zeigt die vom Backend geladenen Aufgaben an', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        { id: 1, title: 'Einkaufen', date: '2026-07-03' },
        { id: 2, title: 'Lernen', date: '2026-07-04' },
      ],
    }))

    const wrapper = mount(TaskList)
    await flushPromises()

    expect(wrapper.text()).toContain('Einkaufen')
    expect(wrapper.text()).toContain('Lernen')
    expect(wrapper.findAll('.task-item')).toHaveLength(2)
  })

  it('speichert eine neue Aufgabe ueber das Backend und zeigt sie an', async () => {
    const fetchMock = vi.fn()
      // 1. Aufruf: GET beim Laden der Seite
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
      // 2. Aufruf: POST beim Speichern
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 5, title: 'Neue Aufgabe', date: '2026-07-05' }),
      })
    vi.stubGlobal('fetch', fetchMock)

    const wrapper = mount(TaskList)
    await flushPromises()

    await wrapper.find('input[placeholder="Neue Aufgabe..."]').setValue('Neue Aufgabe')
    await wrapper.find('button').trigger('click')
    await flushPromises()

    expect(fetchMock).toHaveBeenCalledTimes(2)
    const postCall = fetchMock.mock.calls[1]
    expect(postCall[1].method).toBe('POST')
    expect(wrapper.text()).toContain('Neue Aufgabe')
  })

  it('speichert nichts, wenn das Eingabefeld leer ist', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => [] })
    vi.stubGlobal('fetch', fetchMock)

    const wrapper = mount(TaskList)
    await flushPromises()

    await wrapper.find('button').trigger('click')
    await flushPromises()

    // Nur der GET-Aufruf beim Laden, kein POST
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('zeigt beim Klick auf eine Aufgabe die Aktionen an', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ id: 1, title: 'Einkaufen', date: '', pinned: false }],
    }))

    const wrapper = mount(TaskList)
    await flushPromises()

    expect(wrapper.text()).not.toContain('Entfernen')

    await wrapper.find('.task-item').trigger('click')

    expect(wrapper.text()).toContain('Anheften')
    expect(wrapper.text()).toContain('Entfernen')
  })

  it('entfernt eine Aufgabe ueber den Entfernen-Button', async () => {
    const fetchMock = vi.fn()
      // 1. Aufruf: GET beim Laden
      .mockResolvedValueOnce({ ok: true, json: async () => [{ id: 1, title: 'Einkaufen', date: '', pinned: false }] })
      // 2. Aufruf: DELETE
      .mockResolvedValueOnce({ ok: true })
    vi.stubGlobal('fetch', fetchMock)

    const wrapper = mount(TaskList)
    await flushPromises()

    await wrapper.find('.task-item').trigger('click')
    const deleteBtn = wrapper.findAll('button').find(b => b.text().includes('Entfernen'))
    await deleteBtn.trigger('click')
    await flushPromises()

    const deleteCall = fetchMock.mock.calls[1]
    expect(deleteCall[0]).toContain('/tasks/1')
    expect(deleteCall[1].method).toBe('DELETE')
    expect(wrapper.findAll('.task-item')).toHaveLength(0)
  })

  it('heftet eine Aufgabe an, zeigt das Pin-Symbol und sortiert sie nach oben', async () => {
    const fetchMock = vi.fn()
      // 1. Aufruf: GET beim Laden
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          { id: 1, title: 'Erste Aufgabe', date: '', pinned: false },
          { id: 2, title: 'Zweite Aufgabe', date: '', pinned: false },
        ],
      })
      // 2. Aufruf: PUT /tasks/2/pin
      .mockResolvedValueOnce({ ok: true, json: async () => ({ id: 2, title: 'Zweite Aufgabe', date: '', pinned: true }) })
    vi.stubGlobal('fetch', fetchMock)

    const wrapper = mount(TaskList)
    await flushPromises()

    await wrapper.findAll('.task-item')[1].trigger('click')
    const pinBtn = wrapper.findAll('button').find(b => b.text().includes('Anheften'))
    await pinBtn.trigger('click')
    await flushPromises()

    const pinCall = fetchMock.mock.calls[1]
    expect(pinCall[0]).toContain('/tasks/2/pin')
    expect(pinCall[1].method).toBe('PUT')

    // Angeheftete Aufgabe steht jetzt ganz oben und hat ein Pin-Symbol
    const items = wrapper.findAll('.task-item')
    expect(items[0].text()).toContain('Zweite Aufgabe')
    expect(items[0].find('.pin-badge').exists()).toBe(true)
    expect(items[1].find('.pin-badge').exists()).toBe(false)
  })
})
