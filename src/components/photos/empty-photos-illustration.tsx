import emptyPhotosIllustration from '../../assets/empty-photos.png';

export function EmptyPhotosIllustration() {
  return (
    <img
      src={emptyPhotosIllustration}
      alt=""
      aria-hidden="true"
      className="mx-auto h-20 w-auto"
    />
  );
}
