﻿using System.Collections.Generic;
using Coevery.Events;

namespace Coevery.Tokens {
    public interface ITokenizer : IDependency {
        IDictionary<string, object> Evaluate(IEnumerable<string> tokens, object data);
        IDictionary<string, object> Evaluate(IEnumerable<string> tokens, IDictionary<string, object> data);
        string Replace(string text, object data);
        string Replace(string text, object data, ReplaceOptions options);
        string Replace(string text, IDictionary<string, object> data);
        string Replace(string text, IDictionary<string, object> data, ReplaceOptions options);
    }
}