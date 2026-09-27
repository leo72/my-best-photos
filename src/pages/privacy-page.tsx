import { TextLink } from '../components/ui/text-link';
import {
  LegalDocument,
  LegalSection,
} from '../components/legal/legal-document';

export function PrivacyPage() {
  return (
    <LegalDocument
      title="Privacy Policy"
      updated="27 September 2026"
    >
      <p>
        My10Photos is a place to keep up to 10 photos on a
        page other people can open. This policy describes
        what we handle when you use the site.
      </p>

      <LegalSection title="Information you give us">
        <p>
          To create an account we ask for an email address
          and a password. We email you a verification link.
          You cannot use the signed-in parts of the product
          until that address is verified. We do not offer
          Google sign-in.
        </p>
        <p>
          You can upload up to 10 photos and set a title and
          a collection type: year, collection, or profile.
          Those photos and that title are the content of
          your page.
        </p>
      </LegalSection>

      <LegalSection title="Information created by using the site">
        <p>
          We store an account id, whether your email is
          verified, and the time your collection was created
          or updated. Our hosting and infrastructure
          providers also process technical data such as IP
          address and browser details so the site can be
          served and protected. We do not run advertising or
          our own analytics product.
        </p>
      </LegalSection>

      <LegalSection title="How we use it">
        <p>
          We use this information to create and sign you in,
          store and show your photos, send the verification
          email, and operate and protect the service. We do
          not sell your information.
        </p>
      </LegalSection>

      <LegalSection title="Photos are public">
        <p>
          There is no private mode. When a photo finishes
          uploading, the version shown on the site is public.
          Anyone with your page link can see every ready
          photo and your collection title. That link is /u/
          followed by your account id.
        </p>
        <p>
          The original file you uploaded stays available only
          to your account. Photos that are still uploading,
          and photos you delete, are not on the public page.
          Do not upload a photo you are not willing to have
          seen by anyone who has the link.
        </p>
      </LegalSection>

      <LegalSection title="Who processes it">
        <p>
          Google Firebase provides authentication, the
          database, file storage, and the server functions
          that process uploads and deletions. Cloudflare
          sits in front of the site and caches pages and
          files. GitHub Pages hosts the website files.
          These providers process data only so My10Photos
          can run.
        </p>
      </LegalSection>

      <LegalSection title="How long we keep it">
        <p>
          We keep your account, collection, and photos while
          your account is open. Deleting a photo removes it
          from your set and from your public page. To close
          the account, contact us and we will delete the
          account and the remaining photos. We may keep a
          minimal record if we must do so to meet a legal
          duty or to resolve a dispute.
        </p>
      </LegalSection>

      <LegalSection title="Your choices">
        <p>
          You can change your password, delete individual
          photos, and sign out in the product. You can ask
          us what we hold about you and ask us to correct or
          delete it. You can also use your browser controls
          to clear the sign-in data stored on your device.
        </p>
      </LegalSection>

      <LegalSection title="Children">
        <p>
          My10Photos is not for children under 13 to create
          an account. If you upload a photo of someone else,
          including a child, you are responsible for having
          the right to do that.
        </p>
      </LegalSection>

      <LegalSection title="Changes">
        <p>
          If this policy changes, we will post the new
          version on this page and update the date above.
        </p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>
          My10Photos. Questions about this policy are
          covered together with the{' '}
          <TextLink to="/terms">Terms of Service</TextLink>.
        </p>
      </LegalSection>
    </LegalDocument>
  );
}
