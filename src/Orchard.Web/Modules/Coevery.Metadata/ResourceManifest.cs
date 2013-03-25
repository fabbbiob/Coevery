using Orchard.UI.Resources;

namespace Coevery.Metadata {
    public class ResourceManifest : IResourceManifestProvider {
        public void BuildManifests(ResourceManifestBuilder builder) {
            var manifest = builder.Add();

            manifest.DefineScript("MetadataContext").SetUrl("app/context.js");
            manifest.DefineScript("MetadataController").SetUrl("controllers/listcontroller.js");
            manifest.DefineScript("MetadataDetailController").SetUrl("controllers/detailcontroller.js");
            manifest.DefineScript("FieldCtrl").SetUrl("controllers/fieldlistcontroller.js");
            manifest.DefineScript("FieldDetailCtrl").SetUrl("controllers/fielddetailcontroller.js");
        }
    }
}
