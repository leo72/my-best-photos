import { TextLink } from '../components/ui/text-link';
import {
  LegalDocument,
  LegalSection,
} from '../components/legal/legal-document';

export function TermsPage() {
  return (
    <LegalDocument
      title="Terms of Service"
      updated="27 September 2026"
    >
      <p>
        These terms cover your use of My10Photos. By
        creating an account, you agree to them.
      </p>

      <LegalSection title="The service">
        <p>
          My10Photos lets you store up to 10 photos on a
          public page. The product is free.
          There is no trial period and no fee. It stays free
          for as long as the product exists. We may change
          or stop the product. If we stop it, we will not
          charge you, because we never do.
        </p>
      </LegalSection>

      <LegalSection title="Your account">
        <p>
          You need an account with a valid email address and
          a password. You must verify the email before using
          the signed-in product. You are responsible for
          activity under your account and for keeping the
          password private. One person should use one
          account.
        </p>
      </LegalSection>

      <LegalSection title="Your photos">
        <p>
          You keep your rights to the photos you upload. You
          give My10Photos permission to store, process,
          display, and transmit those photos only so we can
          run the service for you, including showing them on
          your public page.
        </p>
        <p>
          Photos are public by default. There is no way to
          keep a finished photo private at this moment. Anyone with your
          page link can view every photo that is ready.
          Uploading a photo means you want that version on
          the public page.
        </p>
        <p>
          You must have the right to upload each photo. Do
          not upload anything illegal, or anything that
          infringes someone else’s rights. You are
          responsible for what you upload and for who can
          open your page.
        </p>
        <p>
          You can delete a photo in the product. Deleting it
          removes it from your set and from the public page.
        </p>
      </LegalSection>

      <LegalSection title="Acceptable use">
        <p>
          Do not misuse the service. That includes trying to
          break or overload it, accessing another person’s
          account, or uploading malware. We may remove
          content or close an account that breaks these
          terms.
        </p>
      </LegalSection>

      <LegalSection title="Ending your account">
        <p>
          You can sign out at any time. To close the account
          and delete what remains, contact us. We may
          suspend or close an account that violates these
          terms.
        </p>
      </LegalSection>

      <LegalSection title="Disclaimers">
        <p>
          The service is provided as is. We do not promise
          that it will always be available, that a photo
          will never be lost, or that it will meet a
          particular purpose. Keep your own copies of photos
          that matter.
        </p>
      </LegalSection>

      <LegalSection title="Liability">
        <p>
          To the extent the law allows, My10Photos is not
          liable for indirect or consequential loss, or for
          loss of photos, data, or profits, arising from
          your use of the service. Nothing in these terms
          limits liability that cannot legally be limited.
        </p>
      </LegalSection>

      <LegalSection title="Changes">
        <p>
          We may update these terms by posting a new version
          on this page. If you keep using My10Photos after
          that, the new terms apply.
        </p>
      </LegalSection>

      <LegalSection title="Law">
        <p>
          These terms are governed by the laws that apply
          where My10Photos is operated.
        </p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>
          My10Photos. How we handle account information is
          described in the{' '}
          <TextLink to="/privacy">Privacy Policy</TextLink>.
        </p>
      </LegalSection>
    </LegalDocument>
  );
}
