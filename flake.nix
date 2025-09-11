{
  inputs = {
    utils.url = "github:numtide/flake-utils";
  };

  outputs = {
    self,
    nixpkgs,
    utils,
  }:
    utils.lib.eachDefaultSystem (system: let
      pkgs = nixpkgs.legacyPackages."${system}";
    in {
      devShell = pkgs.mkShell {
        packages = with pkgs; [
          nodejs_24
          yarn
          (google-cloud-sdk.withExtraComponents [google-cloud-sdk.components.gke-gcloud-auth-plugin])

          pandoc
          texliveSmall
        ];
      };
    });
}
