export default function Preloader({ fading }: { fading: boolean }) {
  return (
    <div className={`preloader ${fading ? 'preloader-hide' : ''}`}>
      <span className="preloader-name font-lateral font-extrabold">SERGEY</span>
    </div>
  )
}
