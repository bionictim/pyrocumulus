App.Class = (function (jquery, underscore) {
    var $ = jquery;
    var _ = underscore;

    //var inherit = (function () {
    //    function F() { }
    //    return function (child, parent) {
    //        F.prototype = parent.prototype;
    //        child.prototype = new F;
    //        child.prototype.constructor = child;
    //        child.superproto = parent.prototype;
    //        return child;
    //    };
    //})();

    var inherit = function (subclass, superclass) {
        function Dummy() { }
        Dummy.prototype = superclass.prototype;
        subclass.prototype = new Dummy();
        subclass.prototype.constructor = subclass;
        subclass.superclass = superclass;
        subclass.superproto = superclass.prototype;
    };

    var define = function (constructor, prototypeMembers, staticMembers) {
        if (!!prototypeMembers)
            for (var member in prototypeMembers)
                constructor.prototype[member] = prototypeMembers[member];

        if (!!staticMembers)
            for (var member in staticMembers)
                constructor[member] = staticMembers[member];

        return constructor;
    };

    var derive = function (parentConstructor, childConstructor, prototypeMembers, staticMembers) {
        inherit(childConstructor, parentConstructor);
        return define(childConstructor, prototypeMembers, staticMembers);
    };

    return {
        define: define,
        derive: derive
    };

})($, _);