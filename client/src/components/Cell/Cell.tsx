import './Cell.css'

interface Props {
  type: string
}

export default function Cell({ type }: Props) {
  return <div className={`cell ${type}`}></div>
}
