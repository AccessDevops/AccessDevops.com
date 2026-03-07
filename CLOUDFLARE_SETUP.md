# Configuration Cloudflare pour AccessDevOps

## Prérequis
- Accès au registrar de votre domaine (pour changer les nameservers)
- IP de votre VM: 34.52.172.6

## Étape 1: Créer un compte Cloudflare

1. Allez sur https://dash.cloudflare.com/sign-up
2. Créez un compte gratuit
3. Ajoutez votre domaine: `accessdevops.com`

## Étape 2: Configuration DNS

Cloudflare va scanner vos DNS actuels. Vérifiez/ajoutez ces enregistrements:

```
Type    Name              Content           Proxy
A       accessdevops.com  34.52.172.6       ✅ Proxied (orange cloud)
A       www               34.52.172.6       ✅ Proxied (orange cloud)
```

**IMPORTANT:** Le cloud orange doit être activé (Proxied) pour bénéficier de la protection.

## Étape 3: Changer les Nameservers

Cloudflare vous donnera 2 nameservers, par exemple:
```
alice.ns.cloudflare.com
bob.ns.cloudflare.com
```

**Chez votre registrar (OVH, Gandi, etc.):**
1. Allez dans la gestion DNS de `accessdevops.com`
2. Remplacez les nameservers actuels par ceux de Cloudflare
3. Attendez 5-60 minutes pour la propagation

## Étape 4: Configurer SSL/TLS

**Dans Cloudflare Dashboard → SSL/TLS:**

1. **Encryption Mode:** Choisissez **"Full (strict)"**
   - Cela nécessite un certificat SSL valide sur votre VM
   - Gardez votre Let's Encrypt actuel sur la VM

2. **Edge Certificates:**
   - ✅ Always Use HTTPS: ON
   - ✅ Automatic HTTPS Rewrites: ON
   - ✅ Minimum TLS Version: 1.2

## Étape 5: Activer les protections (Free Plan)

### Firewall Rules (gratuit)
**Dashboard → Security → WAF:**
- Activez "OWASP ModSecurity Core Rule Set"
- Créez une règle custom pour bloquer les IPs suspectes si besoin

### DDoS Protection (automatique)
**Dashboard → Security → DDoS:**
- Rien à configurer, c'est automatique!
- Protection jusqu'à plusieurs Tbps

### Rate Limiting (Pro Plan requis)
Si vous prenez le plan Pro, créez des règles:
- Max 100 requêtes/minute par IP
- Blocage temporaire après dépassement

## Étape 6: Optimisations de performance

### Caching
**Dashboard → Caching → Configuration:**
```
Browser Cache TTL: 4 hours
```

### Speed
**Dashboard → Speed → Optimization:**
- ✅ Auto Minify: HTML, CSS, JS
- ✅ Brotli compression
- ✅ Rocket Loader™ (optionnel, à tester)

## Étape 7: Analytics

**Dashboard → Analytics → Traffic:**
- Consultez les statistiques de trafic
- Voyez les attaques bloquées
- Analysez les performances

## Migration depuis Let's Encrypt

**Sur votre VM, GARDEZ Let's Encrypt!**

Cloudflare fait du "SSL Termination" mais communique avec votre VM en HTTPS.

```
Client → Cloudflare (SSL Cloudflare) → Votre VM (SSL Let's Encrypt)
```

**Ne désactivez PAS certbot**, Cloudflare vérifie que votre VM a bien un certificat valide.

## Vérification finale

1. **Test DNS:**
   ```bash
   dig accessdevops.com
   # Doit retourner une IP Cloudflare (pas 34.52.172.6 directement)
   ```

2. **Test SSL:**
   ```bash
   curl -I https://accessdevops.com
   # Doit retourner 200 OK avec certificat Cloudflare
   ```

3. **Test WAF:**
   Essayez d'accéder avec un user-agent suspect:
   ```bash
   curl -H "User-Agent: <script>alert('xss')</script>" https://accessdevops.com
   # Devrait être bloqué
   ```

## Coûts

- **Plan Free:** 0€/mois (suffisant pour commencer)
- **Plan Pro:** 20$/mois (~19€) si vous voulez WAF avancé + Rate Limiting

## Support

- Documentation: https://developers.cloudflare.com/
- Community: https://community.cloudflare.com/
- Support: Dashboard → Support (chat disponible pour Pro+)

## Rollback en cas de problème

Si quelque chose ne fonctionne pas:
1. Retournez chez votre registrar
2. Remettez les anciens nameservers
3. Attendez 5-60 minutes
4. Votre site fonctionnera comme avant
