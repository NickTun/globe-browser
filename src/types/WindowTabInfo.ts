type WindowTabInfo = {
  title: string,
  url: string | undefined,
  selection: string | null | undefined,
  focus: boolean,
  active: boolean,
  windowId: number,
  tab_id: number
}

export default WindowTabInfo