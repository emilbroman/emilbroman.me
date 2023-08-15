locals {
  domain = data.terraform_remote_state.cloud.outputs.domain
  zone   = data.terraform_remote_state.cloud.outputs.dns_zone_name
}

resource "google_dns_record_set" "atproto" {
  name = "_atproto.${local.domain}."
  type = "TXT"
  ttl  = 300

  managed_zone = local.zone

  rrdatas = ["\"did=did:plc:2dsppbxgaljrmbwy2nhlpfjf\""]
}

resource "google_dns_record_set" "spf" {
  name = "${local.domain}."
  type = "TXT"
  ttl  = 300

  managed_zone = local.zone

  rrdatas = ["\"v=spf1 include:spf.messagingengine.com ?all\""]
}

resource "google_dns_record_set" "mx" {
  name = "${local.domain}."
  type = "MX"
  ttl  = 300

  managed_zone = local.zone

  rrdatas = [
    "10 in1-smtp.messagingengine.com.",
    "20 in2-smtp.messagingengine.com.",
  ]
}

resource "google_dns_record_set" "dkim" {
  count = 3
  name  = "fm${count.index + 1}._domainkey.${local.domain}."
  type  = "CNAME"
  ttl   = 300

  managed_zone = local.zone

  rrdatas = ["fm${count.index + 1}.${local.domain}.dkim.fmhosted.com."]
}

resource "google_dns_record_set" "dmarc" {
  name = "_dmarc.${local.domain}."
  type = "TXT"
  ttl  = 300

  managed_zone = local.zone

  rrdatas = ["\"v=DMARC1;p=reject\""]
}
