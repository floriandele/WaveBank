import { company } from '../data/company'

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 md:grid-cols-3">
        <div>
          <div className="flex items-baseline gap-1">
            <span className="font-display text-lg font-extrabold tracking-tight text-navy">Wave</span>
            <span className="font-display text-lg font-extrabold tracking-tight text-blue">Bank Pro</span>
          </div>
          <p className="mt-3 max-w-xs text-sm text-slate-ink">
            La banque en ligne des professionnels : comptes, trésorerie et factures réunis au même
            endroit pour {company.name}.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-navy">Assistance</h4>
          <ul className="mt-3 space-y-2 text-sm text-slate-ink">
            <li>
              <a href="#" className="hover:text-navy">
                Sécurité
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-navy">
                Contact conseiller
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-navy">
                Centre d'aide
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-navy">Informations légales</h4>
          <ul className="mt-3 space-y-2 text-sm text-slate-ink">
            <li>
              <a href="#" className="hover:text-navy">
                Mentions légales
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-navy">
                Conditions générales
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-navy">
                Politique de confidentialité
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line py-4 text-center text-xs text-slate-ink">
        © {new Date().getFullYear()} WaveBank Pro — Démonstrateur Wavestone
      </div>
    </footer>
  )
}
